import type { Prisma } from '@/generated/prisma/client';
import { ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

import { createImportRecords } from './import-session';
import type { ImportResult } from './orchestrator';
import { validateAndTransformActivities } from './pipedrive-schemas/activity.schema';
import { withRetry } from './retry';

interface ImportActivitiesOptions {
  sessionId: string;
  userId: string;
  csvContent: string;
  dealIdMap: Map<string, string>;
  personIdMap: Map<string, string>;
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
 * Import activities from CSV - optimized with batch deduplication
 */
export async function importActivities(
  sessionId: string,
  userId: string,
  csvContent: string,
  dealIdMap: Map<string, string>,
  personIdMap: Map<string, string>,
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
): Promise<ImportResult['activities']> {
  const { parseCSVString } = await import('./csv-parser');
  const { data: rows } =
    await parseCSVString<Record<string, string>>(csvContent);

  const { valid, invalid } = validateAndTransformActivities(rows as any[]);

  const recordsToCreate: Array<{
    sessionId: string;
    entityType: 'ACTIVITY';
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

  for (const activity of valid) {
    externalIdsToCheck.add(activity.externalId);
  }

  // Batch check existing import records
  const existingImportRecords = (await withRetry(() =>
    client.importRecord.findMany({
      where: {
        sessionId,
        entityType: 'ACTIVITY',
        externalId: { in: Array.from(externalIdsToCheck) },
      },
      select: { externalId: true, entityId: true },
    })
  )) as { externalId: string; entityId: string | null }[];
  const existingImportMap = new Map(
    existingImportRecords.map((r) => [r.externalId, r.entityId])
  );

  // Batch find existing activities by externalId (Pipedrive ID)
  const existingActivitiesByExternalId = new Map<string, { id: string }>();
  if (externalIdsToCheck.size > 0) {
    const activitiesByExternalId = (await withRetry(() =>
      client.activity.findMany({
        where: {
          externalId: { in: Array.from(externalIdsToCheck) },
          deletedAt: null,
        },
        select: { id: true, externalId: true },
      })
    )) as { id: string; externalId: string }[];
    for (const activity of activitiesByExternalId) {
      existingActivitiesByExternalId.set(activity.externalId, activity);
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
    const activity = valid[i];
    const rowNumber = i + 1;

    try {
      // Use transaction client if provided, otherwise use default prisma
      const client = tx || prisma;

      // Check if already imported in this session (from batch lookup)
      const existingImportEntityId = existingImportMap.get(activity.externalId);
      if (existingImportEntityId) {
        recordsToCreate.push({
          sessionId,
          entityType: 'ACTIVITY',
          entityId: existingImportEntityId,
          externalId: activity.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: activity,
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

      // Deduplication: check by externalId (Pipedrive ID) - from batch lookup
      const existingActivity = existingActivitiesByExternalId.get(activity.externalId) || null;

      let activityId: string;
      let status: ImportRecordStatus;

      if (existingActivity) {
        // Fetch current activity data to compare
        const currentActivity = await client.activity.findUnique({
          where: { id: existingActivity.id },
          select: {
            subject: true,
            type: true,
            startDate: true,
            endDate: true,
            isDone: true,
            dealId: true,
            personId: true,
            organizationId: true,
          },
        });

        // Check if data has actually changed
        const hasChanges = 
          currentActivity?.subject !== activity.subject ||
          currentActivity?.type !== activity.type ||
          (currentActivity?.startDate?.getTime() ?? null) !== (activity.startDate?.getTime() ?? null) ||
          (currentActivity?.endDate?.getTime() ?? null) !== (activity.endDate?.getTime() ?? null) ||
          currentActivity?.isDone !== activity.isDone ||
          currentActivity?.dealId !== dealId ||
          currentActivity?.personId !== personId ||
          currentActivity?.organizationId !== organizationId;

        if (hasChanges) {
          // Update existing
          await withRetry(() =>
            client.activity.update({
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
            })
          );
          activityId = existingActivity.id;
          status = ImportRecordStatus.UPDATED;
        } else {
          // No changes - skip
          activityId = existingActivity.id;
          status = ImportRecordStatus.SKIPPED;
        }
      } else {
        // Create new
        const newActivity = (await withRetry(() =>
          client.activity.create({
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
              externalId: activity.externalId,
            },
          })
        )) as { id: string };
        activityId = newActivity.id;
        status = ImportRecordStatus.CREATED;
      }

      recordsToCreate.push({
        sessionId,
        entityType: 'ACTIVITY',
        entityId: activityId,
        externalId: activity.externalId,
        rowNumber,
        status,
        rawData: activity,
      });
      if (status === ImportRecordStatus.CREATED) created++;
      else if (status === ImportRecordStatus.UPDATED) updated++;
      else if (status === ImportRecordStatus.SKIPPED) skipped++;
    } catch (error) {
      failed++;
      recordsToCreate.push({
        sessionId,
        entityType: 'ACTIVITY',
        externalId: activity.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: activity,
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
      entityType: 'ACTIVITY',
      externalId: row['Activity - ID'] || `row-${i}`,
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
