import type { Prisma } from '@/generated/prisma/client';
import { ImportEntityType, ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

import { createImportRecords } from './import-session';
import type { ImportResult } from './orchestrator';
import { validateAndTransformOrganizations } from './pipedrive-schemas/organization.schema';
import { isRetryableError, withRetry } from './retry';

interface ImportOrganizationsOptions {
  sessionId: string;
  userId: string;
  csvContent: string;
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
 * Import organizations from CSV - optimized with batch deduplication
 */
export async function importOrganizations(
  sessionId: string,
  userId: string,
  csvContent: string,
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
): Promise<ImportResult['organizations']> {
  const { parseCSVString } = await import('./csv-parser');
  const parseResult = await parseCSVString<Record<string, string>>(csvContent);
  
  // Check for parse errors
  if (parseResult.errors.length > 0) {
    console.error('[IMPORT] Organization CSV parse errors:', parseResult.errors);
    throw new Error(`CSV parse failed: ${parseResult.errors.map(e => e.message).join(', ')}`);
  }
  
  const rows = parseResult.data;
  if (!rows || rows.length === 0) {
    console.error('[IMPORT] Organization CSV parsed 0 rows. First 200 chars:', csvContent.slice(0, 200));
    throw new Error('CSV parsed 0 rows - check file format');
  }

  console.log('[IMPORT] Organization CSV parsed rows:', rows.length);
  console.log('[IMPORT] Organization CSV first row keys:', Object.keys(rows[0]));

  const { valid, invalid } = validateAndTransformOrganizations(rows as any[]);
  
  console.log('[IMPORT] Organization validation:', { valid: valid.length, invalid: invalid.length });
  
  if (valid.length === 0 && invalid.length === 0) {
    console.error('[IMPORT] No valid or invalid rows after validation. Sample row:', JSON.stringify(rows[0]).slice(0, 500));
    throw new Error('Validation produced no results - check column headers match schema');
  }
  
  if (valid.length === 0) {
    console.error('[IMPORT] All organization rows invalid. Errors:', invalid.slice(0, 5).map(i => i.errors));
  }

  const recordsToCreate: Array<{
    sessionId: string;
    entityType: 'ORGANIZATION';
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

  for (const org of valid) {
    externalIdsToCheck.add(org.externalId);
  }

  // Batch check existing import records
  const existingImportRecords = (await withRetry(() =>
    client.importRecord.findMany({
      where: {
        sessionId,
        entityType: 'ORGANIZATION',
        externalId: { in: Array.from(externalIdsToCheck) },
      },
      select: { externalId: true, entityId: true },
    })
  )) as { externalId: string; entityId: string | null }[];
  const existingImportMap = new Map(
    existingImportRecords.map((r) => [r.externalId, r.entityId])
  );

  // Batch find existing organizations by externalId (Pipedrive ID)
  const existingOrgsByExternalId = new Map<string, { id: string }>();
  if (externalIdsToCheck.size > 0) {
    const orgsByExternalId = (await withRetry(() =>
      client.organization.findMany({
        where: {
          externalId: { in: Array.from(externalIdsToCheck) },
          deletedAt: null,
        },
        select: { id: true, externalId: true },
      })
    )) as { id: string; externalId: string }[];
    for (const org of orgsByExternalId) {
      existingOrgsByExternalId.set(org.externalId, org);
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
    const org = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session (from batch lookup)
      const existingImportEntityId = existingImportMap.get(org.externalId);
      if (existingImportEntityId) {
        recordsToCreate.push({
          sessionId,
          entityType: 'ORGANIZATION',
          entityId: existingImportEntityId,
          externalId: org.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: org,
        });
        skipped++;
        if (onProgress) onProgress(i + 1, valid.length, { created, updated, skipped, failed });
        continue;
      }

      // Check if organization exists by externalId (Pipedrive ID) - from batch lookup
      const existingOrg = existingOrgsByExternalId.get(org.externalId) || null;

      let orgId: string;
      let status: ImportRecordStatus;

      if (existingOrg) {
        // Fetch current organization data to compare
        const currentOrg = await client.organization.findUnique({
          where: { id: existingOrg.id },
          select: { name: true },
        });

        // Check if data has actually changed
        const hasChanges = currentOrg?.name !== org.name;

        if (hasChanges) {
          // Update existing
          await withRetry(() =>
            client.organization.update({
              where: { id: existingOrg.id },
              data: { name: org.name, updatedById: userId },
            })
          );
          orgId = existingOrg.id;
          status = ImportRecordStatus.UPDATED;
        } else {
          // No changes - skip
          orgId = existingOrg.id;
          status = ImportRecordStatus.SKIPPED;
        }
      } else {
        // Create new
        const newOrg = (await withRetry(() =>
          client.organization.create({
            data: {
              name: org.name,
              externalId: org.externalId,
              ownerId: userId,
              createdById: userId,
              updatedById: userId,
            },
          })
        )) as { id: string };
        orgId = newOrg.id;
        status = ImportRecordStatus.CREATED;
      }

      recordsToCreate.push({
        sessionId,
        entityType: 'ORGANIZATION',
        entityId: orgId,
        externalId: org.externalId,
        rowNumber,
        status,
        rawData: org,
      });
      if (status === ImportRecordStatus.CREATED) created++;
      else if (status === ImportRecordStatus.UPDATED) updated++;
      else if (status === ImportRecordStatus.SKIPPED) skipped++;
      if (onProgress) onProgress(i + 1, valid.length, { created, updated, skipped, failed });
    } catch (error) {
      failed++;
      recordsToCreate.push({
        sessionId,
        entityType: 'ORGANIZATION',
        externalId: org.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: org,
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
      entityType: 'ORGANIZATION',
      externalId: row['Organization - ID'] || `row-${i}`,
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
