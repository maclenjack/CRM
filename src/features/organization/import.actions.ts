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
import { parseCSVString } from '@/features/shared/import/csv-parser';
import { ImportOrganizationsSchema } from '@/features/shared/import/import-validation';
import {
  type TransformedOrganization,
  validateAndTransformOrganizations,
} from '@/features/shared/import/pipedrive-schemas/organization.schema';
import {
  ImportEntityType,
  ImportRecordStatus,
  ImportSessionStatus,
  ImportSource,
} from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

const ORGANIZATIONS_PATH = '/contacts/organizations';

/**
 * Import organizations from CSV content
 * This is called by the orchestrator
 */
export async function importOrganizationsFromCsv(
  sessionId: string,
  userId: string,
  csvContent: string
): Promise<{
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}> {
  const { data: rows } =
    await parseCSVString<Record<string, string>>(csvContent);
  const { valid, invalid } = validateAndTransformOrganizations(rows as any[]);

  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < valid.length; i++) {
    const org = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session
      const existing = await prisma.importRecord.findUnique({
        where: {
          sessionId_entityType_externalId: {
            sessionId,
            entityType: ImportEntityType.ORGANIZATION,
            externalId: org.externalId,
          },
        },
      });

      if (existing?.entityId) {
        await createImportRecord({
          sessionId,
          entityType: ImportEntityType.ORGANIZATION,
          entityId: existing.entityId,
          externalId: org.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: org,
        });
        skipped++;
        continue;
      }

      // Deduplication: check by name (case-insensitive)
      const existingOrg = await prisma.organization.findFirst({
        where: {
          name: { equals: org.name, mode: 'insensitive' },
          deletedAt: null,
        },
      });

      let orgId: string;
      let status: ImportRecordStatus;

      if (existingOrg) {
        // Update existing
        await prisma.organization.update({
          where: { id: existingOrg.id },
          data: { updatedById: userId },
        });
        orgId = existingOrg.id;
        status = ImportRecordStatus.UPDATED;
        updated++;
      } else {
        // Create new
        const newOrg = await prisma.organization.create({
          data: {
            name: org.name,
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        orgId = newOrg.id;
        status = ImportRecordStatus.CREATED;
        created++;
      }

      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.ORGANIZATION,
        entityId: orgId,
        externalId: org.externalId,
        rowNumber,
        status,
        rawData: org,
      });
    } catch (error) {
      failed++;
      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.ORGANIZATION,
        externalId: org.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: org,
      });
    }
  }

  // Add invalid rows
  for (let i = 0; i < invalid.length; i++) {
    const { row, errors } = invalid[i];
    failed++;
    await createImportRecord({
      sessionId,
      entityType: ImportEntityType.ORGANIZATION,
      externalId: row['Organization - ID'] || `row-${i}`,
      rowNumber: valid.length + i + 1,
      status: ImportRecordStatus.FAILED,
      errorMessage: errors.join('; '),
      rawData: row,
    });
  }

  return { created, updated, skipped, failed };
}

/**
 * Server action for importing organizations (used by orchestrator)
 */
export async function importOrganizationsAction(rawInput: unknown) {
  return actionPipeline({
    schema: ImportOrganizationsSchema,
    rawInput,
    actionName: 'ImportOrganizations',
    handler: async (data, userId) => {
      const result = await importOrganizationsFromCsv(
        data.sessionId,
        userId,
        data.csvContent
      );
      revalidatePath(ORGANIZATIONS_PATH);
      return result;
    },
  });
}

/**
 * Validate organizations CSV without importing
 */
export async function validateOrganizationsCsv(rawInput: unknown) {
  return actionPipeline({
    schema: z.object({ csvContent: z.string().min(1) }),
    rawInput,
    actionName: 'ValidateOrganizationsCsv',
    handler: async (data) => {
      const { data: rows } = await parseCSVString<Record<string, string>>(
        data.csvContent
      );
      const { valid, invalid } = validateAndTransformOrganizations(
        rows as any[]
      );

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
