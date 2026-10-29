'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import {
  buildExternalIdMap,
  createImportRecord,
} from '@/features/shared/import';
import { parseCSVString } from '@/features/shared/import/csv-parser';
import { ImportDealsSchema } from '@/features/shared/import/import-validation';
import {
  type TransformedDeal,
  validateAndTransformDeals,
} from '@/features/shared/import/pipedrive-schemas/deal.schema';
import { Prisma } from '@/generated/prisma/client';
import { ImportEntityType, ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

const DEALS_PATH = '/deals';

/**
 * Import deals from CSV content
 * This is called by the orchestrator
 */
export async function importDealsFromCsv(
  sessionId: string,
  userId: string,
  csvContent: string,
  personIdMap: Map<string, string>,
  orgIdMap: Map<string, string>
): Promise<{
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}> {
  const { data: rows } =
    await parseCSVString<Record<string, string>>(csvContent);
  const { valid, invalid } = validateAndTransformDeals(rows as any[]);

  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < valid.length; i++) {
    const deal = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session
      const existing = await prisma.importRecord.findUnique({
        where: {
          sessionId_entityType_externalId: {
            sessionId,
            entityType: ImportEntityType.DEAL,
            externalId: deal.externalId,
          },
        },
      });

      if (existing?.entityId) {
        await createImportRecord({
          sessionId,
          entityType: ImportEntityType.DEAL,
          entityId: existing.entityId,
          externalId: deal.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: deal,
        });
        skipped++;
        continue;
      }

      // Resolve person and organization IDs
      const personId = deal.personExternalId
        ? personIdMap.get(deal.personExternalId)
        : null;
      const organizationId = deal.organizationExternalId
        ? orgIdMap.get(deal.organizationExternalId)
        : null;

      if (!personId || !organizationId) {
        throw new Error('Missing required person or organization reference');
      }

      // Deduplication: check by title + person + organization
      const existingDeal = await prisma.deal.findFirst({
        where: {
          title: deal.title,
          personId,
          organizationId,
          deletedAt: null,
        },
      });

      let dealId: string;
      let status: ImportRecordStatus;

      if (existingDeal) {
        // Update existing
        await prisma.deal.update({
          where: { id: existingDeal.id },
          data: {
            value: new Prisma.Decimal(deal.value),
            currency: deal.currency,
            stage: deal.stage,
            status: deal.status,
            expectedCloseDate: deal.expectedCloseDate,
            updatedById: userId,
          },
        });
        dealId = existingDeal.id;
        status = ImportRecordStatus.UPDATED;
        updated++;
      } else {
        // Create new
        const newDeal = await prisma.deal.create({
          data: {
            title: deal.title,
            value: new Prisma.Decimal(deal.value),
            currency: deal.currency,
            stage: deal.stage,
            status: deal.status,
            expectedCloseDate: deal.expectedCloseDate,
            personId,
            organizationId,
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        dealId = newDeal.id;
        status = ImportRecordStatus.CREATED;
        created++;
      }

      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.DEAL,
        entityId: dealId,
        externalId: deal.externalId,
        rowNumber,
        status,
        rawData: deal,
      });
    } catch (error) {
      failed++;
      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.DEAL,
        externalId: deal.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: deal,
      });
    }
  }

  // Add invalid rows
  for (let i = 0; i < invalid.length; i++) {
    const { row, errors } = invalid[i];
    failed++;
    await createImportRecord({
      sessionId,
      entityType: ImportEntityType.DEAL,
      externalId: row['Deal - ID'] || `row-${i}`,
      rowNumber: valid.length + i + 1,
      status: ImportRecordStatus.FAILED,
      errorMessage: errors.join('; '),
      rawData: row,
    });
  }

  return { created, updated, skipped, failed };
}

/**
 * Server action for importing deals (used by orchestrator)
 */
export async function importDealsAction(rawInput: unknown) {
  return actionPipeline({
    schema: ImportDealsSchema,
    rawInput,
    actionName: 'ImportDeals',
    handler: async (data, userId) => {
      throw new Error(
        'Use orchestrator for full import. This action requires personIdMap and orgIdMap from previous phases.'
      );
    },
  });
}

/**
 * Validate deals CSV without importing
 */
export async function validateDealsCsv(rawInput: unknown) {
  return actionPipeline({
    schema: z.object({ csvContent: z.string().min(1) }),
    rawInput,
    actionName: 'ValidateDealsCsv',
    handler: async (data) => {
      const { data: rows } = await parseCSVString<Record<string, string>>(
        data.csvContent
      );
      const { valid, invalid } = validateAndTransformDeals(rows as any[]);

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
