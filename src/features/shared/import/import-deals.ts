import type { Prisma } from '@/generated/prisma/client';
import { ImportRecordStatus } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

import { createImportRecords } from './import-session';
import type { ImportResult } from './orchestrator';
import { validateAndTransformDeals } from './pipedrive-schemas/deal.schema';
import { withRetry } from './retry';

interface ImportDealsOptions {
  sessionId: string;
  userId: string;
  csvContent: string;
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
 * Import deals from CSV - optimized with batch deduplication
 */
export async function importDeals(
  sessionId: string,
  userId: string,
  csvContent: string,
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
): Promise<ImportResult['deals']> {
  const { parseCSVString } = await import('./csv-parser');
  const { data: rows } =
    await parseCSVString<Record<string, string>>(csvContent);

  const { valid, invalid } = validateAndTransformDeals(rows as any[]);

  const recordsToCreate: Array<{
    sessionId: string;
    entityType: 'DEAL';
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

  for (const deal of valid) {
    externalIdsToCheck.add(deal.externalId);
  }

  // Batch check existing import records
  const existingImportRecords = (await withRetry(() =>
    client.importRecord.findMany({
      where: {
        sessionId,
        entityType: 'DEAL',
        externalId: { in: Array.from(externalIdsToCheck) },
      },
      select: { externalId: true, entityId: true },
    })
  )) as { externalId: string; entityId: string | null }[];
  const existingImportMap = new Map(
    existingImportRecords.map((r) => [r.externalId, r.entityId])
  );

  // Batch find existing deals by externalId (Pipedrive ID)
  const existingDealsByExternalId = new Map<string, { id: string }>();
  if (externalIdsToCheck.size > 0) {
    const dealsByExternalId = (await withRetry(() =>
      client.deal.findMany({
        where: {
          externalId: { in: Array.from(externalIdsToCheck) },
          deletedAt: null,
        },
        select: { id: true, externalId: true },
      })
    )) as { id: string; externalId: string }[];
    for (const deal of dealsByExternalId) {
      existingDealsByExternalId.set(deal.externalId, deal);
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
    const deal = valid[i];
    const rowNumber = i + 1;

    try {
      // Use transaction client if provided, otherwise use default prisma
      const client = tx || prisma;

      // Check if already imported in this session (from batch lookup)
      const existingImportEntityId = existingImportMap.get(deal.externalId);
      if (existingImportEntityId) {
        recordsToCreate.push({
          sessionId,
          entityType: 'DEAL',
          entityId: existingImportEntityId,
          externalId: deal.externalId,
          rowNumber,
          status: ImportRecordStatus.SKIPPED,
          rawData: deal,
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

      // Deduplication: check by externalId (Pipedrive ID) - from batch lookup
      const existingDeal =
        existingDealsByExternalId.get(deal.externalId) || null;

      let dealId: string;
      let status: ImportRecordStatus;

      if (existingDeal) {
        // Fetch current deal data to compare
        const currentDeal = await client.deal.findUnique({
          where: { id: existingDeal.id },
          select: {
            title: true,
            value: true,
            currency: true,
            stage: true,
            status: true,
            expectedCloseDate: true,
            personId: true,
            organizationId: true,
          },
        });

        // Check if data has actually changed
        const currentValue = currentDeal?.value ? Number(currentDeal.value) : 0;
        const hasChanges =
          currentDeal?.title !== deal.title ||
          currentValue !== deal.value ||
          currentDeal?.currency !== deal.currency ||
          currentDeal?.stage !== deal.stage ||
          currentDeal?.status !== deal.status ||
          (currentDeal?.expectedCloseDate?.getTime() ?? null) !==
            (deal.expectedCloseDate?.getTime() ?? null) ||
          currentDeal?.personId !== personId ||
          currentDeal?.organizationId !== organizationId;

        if (hasChanges) {
          // Update existing
          await withRetry(() =>
            client.deal.update({
              where: { id: existingDeal.id },
              data: {
                value: deal.value,
                currency: deal.currency,
                stage: deal.stage,
                status: deal.status,
                expectedCloseDate: deal.expectedCloseDate,
                updatedById: userId,
              },
            })
          );
          dealId = existingDeal.id;
          status = ImportRecordStatus.UPDATED;
        } else {
          // No changes - skip
          dealId = existingDeal.id;
          status = ImportRecordStatus.SKIPPED;
        }
      } else {
        // Create new
        const newDeal = (await withRetry(() =>
          client.deal.create({
            data: {
              title: deal.title,
              value: deal.value,
              currency: deal.currency,
              stage: deal.stage,
              status: deal.status,
              expectedCloseDate: deal.expectedCloseDate,
              personId,
              organizationId,
              ownerId: userId,
              createdById: userId,
              updatedById: userId,
              externalId: deal.externalId,
            },
          })
        )) as { id: string };
        dealId = newDeal.id;
        status = ImportRecordStatus.CREATED;
      }

      recordsToCreate.push({
        sessionId,
        entityType: 'DEAL',
        entityId: dealId,
        externalId: deal.externalId,
        rowNumber,
        status,
        rawData: deal,
      });
      if (status === ImportRecordStatus.CREATED) created++;
      else if (status === ImportRecordStatus.UPDATED) updated++;
      else if (status === ImportRecordStatus.SKIPPED) skipped++;
    } catch (error) {
      failed++;
      recordsToCreate.push({
        sessionId,
        entityType: 'DEAL',
        externalId: deal.externalId,
        rowNumber,
        status: ImportRecordStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rawData: deal,
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
      entityType: 'DEAL',
      externalId: row['Deal - ID'] || `row-${i}`,
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
