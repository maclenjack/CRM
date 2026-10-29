'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import {
  buildExternalIdMap,
  createImportRecord,
  createImportSession,
  updateImportSession,
} from '@/features/shared/import/import-session';
import {
  parseCSVString,
  validateHeaders,
} from '@/features/shared/import/csv-parser';
import { ImportPeopleSchema } from '@/features/shared/import/import-validation';
import {
  type TransformedPerson,
  validateAndTransformPersons,
} from '@/features/shared/import/pipedrive-schemas/person.schema';
import {
  ImportEntityType,
  ImportRecordStatus,
  ImportSessionStatus,
  ImportSource,
} from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

const PEOPLE_PATH = '/contacts/people';

/**
 * Import people from CSV content
 * This is called by the orchestrator, not directly from UI
 */
export async function importPeopleFromCsv(
  sessionId: string,
  userId: string,
  csvContent: string,
  orgIdMap: Map<string, string>
): Promise<{
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}> {
  const { data: rows } =
    await parseCSVString<Record<string, string>>(csvContent);
  const { valid, invalid } = validateAndTransformPersons(rows as any[]);

  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < valid.length; i++) {
    const person = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session
      const existing = await prisma.importRecord.findUnique({
        where: {
          sessionId_entityType_externalId: {
            sessionId,
            entityType: ImportEntityType.PERSON,
            externalId: person.externalId,
          },
        },
      });

      if (existing?.entityId) {
        await createImportRecord({
          sessionId,
          entityType: ImportEntityType.PERSON,
          entityId: existing.entityId,
          externalId: person.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: person,
        });
        skipped++;
        continue;
      }

      // Resolve organization ID
      let organizationId: string | null = null;
      if (person.organizationExternalId) {
        organizationId = orgIdMap.get(person.organizationExternalId) || null;
      }

      // Deduplication: check by email or phone
      let existingPerson = null;
      if (person.emails.length > 0) {
        existingPerson = await prisma.person.findFirst({
          where: {
            emails: { some: { email: person.emails[0].value } },
            deletedAt: null,
          },
        });
      }
      if (!existingPerson && person.phones.length > 0) {
        existingPerson = await prisma.person.findFirst({
          where: {
            phones: { some: { phone: person.phones[0].value } },
            deletedAt: null,
          },
        });
      }

      let personId: string;
      let status: ImportRecordStatus;

      if (existingPerson) {
        // Update existing
        await prisma.person.update({
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
        });
        personId = existingPerson.id;
        status = ImportRecordStatus.UPDATED;
        updated++;
      } else {
        // Create new
        const newPerson = await prisma.person.create({
          data: {
            name: person.name,
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
        });
        personId = newPerson.id;
        status = ImportRecordStatus.CREATED;
        created++;
      }

      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.PERSON,
        entityId: personId,
        externalId: person.externalId,
        rowNumber,
        status,
        rawData: person,
      });
    } catch (error) {
      failed++;
      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.PERSON,
        externalId: person.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: person,
      });
    }
  }

  // Add invalid rows
  for (let i = 0; i < invalid.length; i++) {
    const { row, errors } = invalid[i];
    failed++;
    await createImportRecord({
      sessionId,
      entityType: ImportEntityType.PERSON,
      externalId: row['Person - ID'] || `row-${i}`,
      rowNumber: valid.length + i + 1,
      status: ImportRecordStatus.FAILED,
      errorMessage: errors.join('; '),
      rawData: row,
    });
  }

  return { created, updated, skipped, failed };
}

/**
 * Server action for importing people (used by orchestrator)
 */
export async function importPeopleAction(rawInput: unknown) {
  return actionPipeline({
    schema: ImportPeopleSchema,
    rawInput,
    actionName: 'ImportPeople',
    handler: async (data, userId) => {
      // This action is called by the orchestrator which already has the session
      // The orchestrator handles the session creation and ID maps
      // This is a placeholder for direct API usage if needed
      throw new Error(
        'Use orchestrator for full import. This action requires orgIdMap from previous phase.'
      );
    },
  });
}

/**
 * Validate people CSV without importing
 */
export async function validatePeopleCsv(rawInput: unknown) {
  return actionPipeline({
    schema: z.object({ csvContent: z.string().min(1) }),
    rawInput,
    actionName: 'ValidatePeopleCsv',
    handler: async (data) => {
      const { data: rows } = await parseCSVString<Record<string, string>>(
        data.csvContent
      );
      const { valid, invalid } = validateAndTransformPersons(rows as any[]);

      return {
        validCount: valid.length,
        invalidCount: invalid.length,
        preview: valid.slice(0, 10),
        errors: invalid
          .slice(0, 20)
          .map(({ row, errors }) => ({ row, errors })),
        headers: rows.length > 0 ? Object.keys(rows[0]) : [],
      };
    },
  });
}
