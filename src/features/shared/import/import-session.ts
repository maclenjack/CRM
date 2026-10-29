import type { Prisma } from '@/generated/prisma/client';
import {
  ImportEntityType,
  ImportRecordStatus,
  ImportSessionStatus,
  ImportSource,
} from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

export type EntityType = 'Person' | 'Organization' | 'Deal' | 'Activity';

export interface CreateImportSessionInput {
  source: ImportSource;
  fileName?: string;
  fileSize?: number;
  createdById: string;
}

export interface CreateImportRecordInput {
  sessionId: string;
  entityType: ImportEntityType;
  entityId?: string;
  externalId: string;
  rowNumber: number;
  status: ImportRecordStatus;
  errorMessage?: string;
  rawData: Prisma.InputJsonValue;
}

export interface ImportRecordWithEntity extends CreateImportRecordInput {
  id: string;
  createdAt: Date;
}

/**
 * Create a new import session
 */
export async function createImportSession(input: CreateImportSessionInput) {
  return prisma.importSession.create({
    data: {
      source: input.source,
      fileName: input.fileName,
      fileSize: input.fileSize,
      createdById: input.createdById,
      status: ImportSessionStatus.PENDING,
    },
  });
}

/**
 * Update import session status and metadata
 */
export async function updateImportSession(
  sessionId: string,
  data: Partial<{
    status: ImportSessionStatus;
    rowCount: number;
    errorCount: number;
    completedAt: Date;
    currentPhase: string;
    totalRecords: number;
    processedRecords: number;
    currentEntityType: string;
    currentEntityProcessed: number;
    currentEntityTotal: number;
    entityProgress: Prisma.InputJsonValue;
  }>,
  tx?: Prisma.TransactionClient
) {
  const client = (tx || prisma) as any;
  return client.importSession.update({
    where: { id: sessionId },
    data,
  });
}

/**
 * Update import session progress - writes directly to database with entityProgress as JSON
 */
export async function updateImportProgress(
  sessionId: string,
  data: {
    currentPhase?: string;
    totalRecords?: number;
    processedRecords?: number;
    currentEntityType?: string;
    currentEntityProcessed?: number;
    currentEntityTotal?: number;
    entityProgress?: Record<
      string,
      {
        total: number;
        processed: number;
        percentage: number;
        created: number;
        updated: number;
        skipped: number;
        failed: number;
      }
    >;
  },
  tx?: Prisma.TransactionClient
) {
  const { entityProgress, ...dbData } = data;
  const client = (tx || prisma) as any;
  await client.importSession.update({
    where: { id: sessionId },
    data: {
      ...dbData,
      entityProgress: data.entityProgress as any,
    },
  });
}

/**
 * Get import session by ID
 */
export async function getImportSession(sessionId: string) {
  return prisma.importSession.findUnique({
    where: { id: sessionId },
    include: {
      records: {
        orderBy: { rowNumber: 'asc' },
      },
    },
  });
}

/**
 * Get import sessions for a user
 */
export async function getImportSessions(userId: string, limit = 20) {
  return prisma.importSession.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { records: true } },
    },
  });
}

/**
 * Create a single import record
 */
export async function createImportRecord(input: CreateImportRecordInput) {
  return prisma.importRecord.create({
    data: {
      sessionId: input.sessionId,
      entityType: input.entityType,
      entityId: input.entityId,
      externalId: input.externalId,
      rowNumber: input.rowNumber,
      status: input.status,
      errorMessage: input.errorMessage,
      rawData: input.rawData,
    },
  });
}

/**
 * Batch create import records (for performance)
 */
export async function createImportRecords(
  inputs: CreateImportRecordInput[],
  tx?: any
) {
  const client = tx || prisma;
  return client.importRecord.createMany({
    data: inputs,
    skipDuplicates: true, // Respects unique constraint on (sessionId, entityType, externalId)
  });
}

/**
 * Find existing import record for deduplication
 */
export async function findExistingImportRecord(
  sessionId: string,
  entityType: ImportEntityType,
  externalId: string
) {
  return prisma.importRecord.findUnique({
    where: {
      sessionId_entityType_externalId: {
        sessionId,
        entityType,
        externalId,
      },
    },
    select: { entityId: true, status: true },
  });
}

/**
 * Update import record status
 */
export async function updateImportRecord(
  recordId: string,
  data: Partial<{
    entityId: string;
    status: ImportRecordStatus;
    errorMessage: string;
  }>
) {
  return prisma.importRecord.update({
    where: { id: recordId },
    data,
  });
}

/**
 * Get import records for a session with filters
 */
export async function getImportRecords(
  sessionId: string,
  filters?: {
    entityType?: ImportEntityType;
    status?: ImportRecordStatus;
  }
) {
  return prisma.importRecord.findMany({
    where: {
      sessionId,
      ...(filters?.entityType && { entityType: filters.entityType }),
      ...(filters?.status && { status: filters.status }),
    },
    orderBy: { rowNumber: 'asc' },
  });
}

/**
 * Get import record counts by status for a session
 */
export async function getImportRecordCounts(sessionId: string) {
  const records = await prisma.importRecord.groupBy({
    by: ['status'],
    where: { sessionId },
    _count: { status: true },
  });

  return records.reduce(
    (acc, r) => {
      acc[r.status] = r._count.status;
      return acc;
    },
    {
      CREATED: 0,
      UPDATED: 0,
      SKIPPED: 0,
      FAILED: 0,
    } as Record<ImportRecordStatus, number>
  );
}

/**
 * Build in-memory ID map for cross-entity resolution
 * Returns Map<externalId, internalId>
 */
export async function buildExternalIdMap(
  sessionId: string,
  entityType: ImportEntityType,
  tx?: Prisma.TransactionClient
): Promise<Map<string, string>> {
  const client = (tx || prisma) as any;
  const records = await client.importRecord.findMany({
    where: {
      sessionId,
      entityType,
      status: {
        in: [
          ImportRecordStatus.CREATED,
          ImportRecordStatus.UPDATED,
          ImportRecordStatus.SKIPPED,
        ],
      },
      entityId: { not: null },
    },
    select: { externalId: true, entityId: true },
  });

  const map = new Map<string, string>();
  for (const r of records) {
    if (r.entityId) {
      map.set(r.externalId, r.entityId);
    }
  }
  return map;
}

/**
 * Delete import session (cascades to records)
 */
export async function deleteImportSession(sessionId: string) {
  return prisma.importSession.delete({
    where: { id: sessionId },
  });
}

/**
 * Mark session as rolled back
 */
export async function rollbackImportSession(sessionId: string) {
  return prisma.importSession.update({
    where: { id: sessionId },
    data: {
      status: ImportSessionStatus.ROLLED_BACK,
      completedAt: new Date(),
    },
  });
}
