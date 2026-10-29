'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';

import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import { buildExternalIdMap, createImportRecord } from '@/features/shared/import/import-session';
import { parseCSVString } from '@/features/shared/import/csv-parser';
import { ImportActivitiesSchema } from '@/features/shared/import/import-validation';
import {
  type TransformedActivity,
  validateAndTransformActivities,
} from '@/features/shared/import/pipedrive-schemas/activity.schema';
import { ImportEntityType, ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

/**
 * Import activities from CSV content
 * This is called by the orchestrator
 */
export async function importActivitiesFromCsv(
  sessionId: string,
  userId: string,
  csvContent: string,
  dealIdMap: Map<string, string>,
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
  const { valid, invalid } = validateAndTransformActivities(rows as any[]);

  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < valid.length; i++) {
    const activity = valid[i];
    const rowNumber = i + 1;

    try {
      // Check if already imported in this session
      const existing = await prisma.importRecord.findUnique({
        where: {
          sessionId_entityType_externalId: {
            sessionId,
            entityType: ImportEntityType.ACTIVITY,
            externalId: activity.externalId,
          },
        },
      });

      if (existing?.entityId) {
        await createImportRecord({
          sessionId,
          entityType: ImportEntityType.ACTIVITY,
          entityId: existing.entityId,
          externalId: activity.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: activity,
        });
        skipped++;
        continue;
      }

      // Resolve optional references
      const dealId = activity.dealExternalId
        ? dealIdMap.get(activity.dealExternalId)
        : null;
      const personId = activity.personExternalId
        ? personIdMap.get(activity.personExternalId)
        : null;
      const organizationId = activity.organizationExternalId
        ? orgIdMap.get(activity.organizationExternalId)
        : null;

      // Deduplication: check by subject + startDate + deal/person
      const existingActivity = await prisma.activity.findFirst({
        where: {
          subject: activity.subject,
          startDate: activity.startDate,
          OR: [dealId ? { dealId } : {}, personId ? { personId } : {}].filter(
            (o) => Object.keys(o).length > 0
          ),
          deletedAt: null,
        },
      });

      let activityId: string;
      let status: ImportRecordStatus;

      if (existingActivity) {
        // Update existing
        await prisma.activity.update({
          where: { id: existingActivity.id },
          data: {
            type: activity.type,
            endDate: activity.endDate,
            isDone: activity.isDone,
            dealId,
            personId,
            organizationId,
            updatedById: userId,
          },
        });
        activityId = existingActivity.id;
        status = ImportRecordStatus.UPDATED;
        updated++;
      } else {
        // Create new
        const newActivity = await prisma.activity.create({
          data: {
            subject: activity.subject,
            type: activity.type,
            startDate: activity.startDate,
            endDate: activity.endDate,
            isDone: activity.isDone,
            dealId,
            personId,
            organizationId,
            ownerId: userId,
            createdById: userId,
            updatedById: userId,
          },
        });
        activityId = newActivity.id;
        status = ImportRecordStatus.CREATED;
        created++;
      }

      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.ACTIVITY,
        entityId: activityId,
        externalId: activity.externalId,
        rowNumber,
        status,
        rawData: activity,
      });
    } catch (error) {
      failed++;
      await createImportRecord({
        sessionId,
        entityType: ImportEntityType.ACTIVITY,
        externalId: activity.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: activity,
      });
    }
  }

  // Add invalid rows
  for (let i = 0; i < invalid.length; i++) {
    const { row, errors } = invalid[i];
    failed++;
    await createImportRecord({
      sessionId,
      entityType: ImportEntityType.ACTIVITY,
      externalId: row['Activity - ID'] || `row-${i}`,
      rowNumber: valid.length + i + 1,
      status: ImportRecordStatus.FAILED,
      errorMessage: errors.join('; '),
      rawData: row,
    });
  }

  return { created, updated, skipped, failed };
}

/**
 * Server action for importing activities (used by orchestrator)
 */
export async function importActivitiesAction(rawInput: unknown) {
  return actionPipeline({
    schema: ImportActivitiesSchema,
    rawInput,
    actionName: 'ImportActivities',
    handler: async (data, userId) => {
      throw new Error(
        'Use orchestrator for full import. This action requires dealIdMap, personIdMap, and orgIdMap from previous phases.'
      );
    },
  });
}

/**
 * Validate activities CSV without importing
 */
export async function validateActivitiesCsv(rawInput: unknown) {
  return actionPipeline({
    schema: z.object({ csvContent: z.string().min(1) }),
    rawInput,
    actionName: 'ValidateActivitiesCsv',
    handler: async (data) => {
      const { data: rows } = await parseCSVString<Record<string, string>>(
        data.csvContent
      );
      const { valid, invalid } = validateAndTransformActivities(rows as any[]);

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
