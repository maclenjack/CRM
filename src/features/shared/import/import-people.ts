import type { Prisma } from '@/generated/prisma/client';
import { ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

import { createImportRecords } from './import-session';
import type { ImportResult } from './orchestrator';
import { validateAndTransformPersons } from './pipedrive-schemas/person.schema';
import { withRetry } from './retry';

interface ImportPeopleOptions {
  sessionId: string;
  userId: string;
  csvContent: string;
  orgIdMap: Map<string, string>;
  debug?: boolean;
  onProgress?: (
    processed: number,
    total: number,
    counts: {
      created: number;
      updated: number;
      skipped: number;
      failed: number;
    }
  ) => void;
  tx?: any;
}

/**
 * Import people from CSV - optimized with batch deduplication
 */
export async function importPeople(
  sessionId: string,
  userId: string,
  csvContent: string,
  orgIdMap: Map<string, string>,
  debug?: boolean,
  onProgress?: (
    processed: number,
    total: number,
    counts: {
      created: number;
      updated: number;
      skipped: number;
      failed: number;
    }
  ) => void,
  tx?: any
): Promise<ImportResult['people']> {
  const { parseCSVString } = await import('./csv-parser');
  const parseResult = await parseCSVString<Record<string, string>>(csvContent);
  
  // Check for parse errors
  if (parseResult.errors.length > 0) {
    console.error('[IMPORT] People CSV parse errors:', parseResult.errors);
    throw new Error(`CSV parse failed: ${parseResult.errors.map(e => e.message).join(', ')}`);
  }
  
  const rows = parseResult.data;
  if (!rows || rows.length === 0) {
    console.error('[IMPORT] People CSV parsed 0 rows. First 200 chars:', csvContent.slice(0, 200));
    throw new Error('CSV parsed 0 rows - check file format');
  }

  console.log('[IMPORT] People CSV parsed rows:', rows.length);
  console.log('[IMPORT] People CSV first row keys:', Object.keys(rows[0]));

  const { valid, invalid } = validateAndTransformPersons(rows as any[]);
  
  console.log('[IMPORT] People validation:', { valid: valid.length, invalid: invalid.length });
  
  if (valid.length === 0 && invalid.length === 0) {
    console.error('[IMPORT] No valid or invalid rows after validation. Sample row:', JSON.stringify(rows[0]).slice(0, 500));
    throw new Error('Validation produced no results - check column headers match schema');
  }
  
  if (valid.length === 0) {
    console.error('[IMPORT] All people rows invalid. Errors:', invalid.slice(0, 5).map(i => i.errors));
  }

  const recordsToCreate: Array<{
    sessionId: string;
    entityType: 'PERSON';
    entityId?: string;
    externalId: string;
    rowNumber: number;
    status: ImportRecordStatus;
    errorMessage?: string;
    rawData: Prisma.InputJsonValue;
  }> = [];

  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  // Use transaction client if provided, otherwise use default prisma
  const client = tx || prisma;

  // --- BATCH DEDUPLICATION: Collect all lookup keys first ---
  const externalIdsToCheck = new Set<string>();

  for (const person of valid) {
    externalIdsToCheck.add(person.externalId);
  }

  // Batch check existing import records
  const existingImportRecords = (await withRetry(() =>
    client.importRecord.findMany({
      where: {
        sessionId,
        entityType: 'PERSON',
        externalId: { in: Array.from(externalIdsToCheck) },
      },
      select: { externalId: true, entityId: true },
    })
  )) as { externalId: string; entityId: string | null }[];
  const existingImportMap = new Map(
    existingImportRecords.map((r) => [r.externalId, r.entityId])
  );

  // Batch find existing people by externalId (Pipedrive ID)
  const existingPeopleByExternalId = new Map<string, { id: string }>();
  if (externalIdsToCheck.size > 0) {
    const peopleByExternalId = (await withRetry(() =>
      client.person.findMany({
        where: {
          externalId: { in: Array.from(externalIdsToCheck) },
          deletedAt: null,
        },
        select: { id: true, externalId: true },
      })
    )) as { id: string; externalId: string }[];
    for (const person of peopleByExternalId) {
      existingPeopleByExternalId.set(person.externalId, person);
    }
  }

  // Report initial progress with zero counts
  if (onProgress) {
    onProgress(0, valid.length, {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    });
  }

  // --- PROCESS ROWS WITH BATCH LOOKUPS ---
  for (let i = 0; i < valid.length; i++) {
    const person = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session (from batch lookup)
      const existingImportEntityId = existingImportMap.get(person.externalId);
      if (existingImportEntityId) {
        recordsToCreate.push({
          sessionId,
          entityType: 'PERSON',
          entityId: existingImportEntityId,
          externalId: person.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: person,
        });
        skipped++;
        if (onProgress)
          onProgress(i + 1, valid.length, {
            created,
            updated,
            skipped,
            failed,
          });
        continue;
      }

      // Resolve organization ID
      let organizationId: string | null = null;
      if (person.organizationExternalId) {
        organizationId = orgIdMap.get(person.organizationExternalId) || null;
      }

      // Deduplication: check by externalId (Pipedrive ID) - from batch lookup
      const existingPerson = existingPeopleByExternalId.get(person.externalId) || null;

      let personId: string;
      let status: ImportRecordStatus;

      if (existingPerson) {
        // Fetch current person data to compare
        const currentPerson = await client.person.findUnique({
          where: { id: existingPerson.id },
          select: {
            name: true,
            organizationId: true,
            phones: { select: { phone: true, category: true } },
            emails: { select: { email: true, category: true } },
          },
        });

        // Check if data has actually changed
        // Sort phones/emails by value for consistent comparison (order doesn't matter)
        const currentPhones = [...(currentPerson?.phones || [])].sort((a, b) => a.phone.localeCompare(b.phone));
        const newPhones = [...person.phones].sort((a, b) => a.value.localeCompare(b.value));
        const phonesMatch = 
          currentPhones.length === newPhones.length &&
          currentPhones.every((p, i) => p.phone === newPhones[i].value && p.category === newPhones[i].category);
        
        const currentEmails = [...(currentPerson?.emails || [])].sort((a, b) => a.email.localeCompare(b.email));
        const newEmails = [...person.emails].sort((a, b) => a.value.localeCompare(b.value));
        const emailsMatch = 
          currentEmails.length === newEmails.length &&
          currentEmails.every((e, i) => e.email === newEmails[i].value && e.category === newEmails[i].category);

        const hasChanges = 
          currentPerson?.name !== person.name ||
          currentPerson?.organizationId !== organizationId ||
          !phonesMatch ||
          !emailsMatch;

        if (hasChanges) {
          // Update existing
          await withRetry(() =>
            client.person.update({
              where: { id: existingPerson.id },
              data: {
                name: person.name,
                organizationId,
                updatedById: userId,
                phones: {
                  deleteMany: {},
                  create: person.phones.map((p) => ({
                    phone: p.value,
                    category: p.category,
                  })),
                },
                emails: {
                  deleteMany: {},
                  create: person.emails.map((e) => ({
                    email: e.value,
                    category: e.category,
                  })),
                },
              },
            })
          );
          personId = existingPerson.id;
          status = ImportRecordStatus.UPDATED;
        } else {
          // No changes - skip
          personId = existingPerson.id;
          status = ImportRecordStatus.SKIPPED;
        }
      } else {
        // Create new
        const newPerson = (await withRetry(() =>
          client.person.create({
            data: {
              name: person.name,
              externalId: person.externalId,
              organizationId,
              ownerId: userId,
              phones: {
                create: person.phones.map((p) => ({
                  phone: p.value,
                  category: p.category,
                })),
              },
              emails: {
                create: person.emails.map((e) => ({
                  email: e.value,
                  category: e.category,
                })),
              },
              createdById: userId,
            },
          })
        )) as { id: string };
        personId = newPerson.id;
        status = ImportRecordStatus.CREATED;
      }

      recordsToCreate.push({
        sessionId,
        entityType: 'PERSON',
        entityId: personId,
        externalId: person.externalId,
        rowNumber,
        status,
        rawData: person,
      });
      if (status === ImportRecordStatus.CREATED) created++;
      else if (status === ImportRecordStatus.UPDATED) updated++;
      else if (status === ImportRecordStatus.SKIPPED) skipped++;
      if (onProgress)
        onProgress(i + 1, valid.length, {
          created,
          updated,
          skipped,
          failed,
        });
    } catch (error) {
      failed++;
      recordsToCreate.push({
        sessionId,
        entityType: 'PERSON',
        externalId: person.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: person,
      });
    }

    // Report progress on every row
    if (onProgress) {
      onProgress(i + 1, valid.length, { created, updated, skipped, failed });
    }
  }

  // Add invalid rows as failed records
  for (let i = 0; i < invalid.length; i++) {
    const { row, errors } = invalid[i];
    failed++;
    recordsToCreate.push({
      sessionId,
      entityType: 'PERSON',
      externalId: row['Person - ID'] || `row-${i}`,
      rowNumber: valid.length + i + 1,
      status: ImportRecordStatus.FAILED,
      errorMessage: errors.join('; '),
      rawData: row,
    });
  }

  // Batch create records
  if (recordsToCreate.length > 0) {
    await createImportRecords(recordsToCreate, tx);
  }

  return { created, updated, skipped, failed };
}
