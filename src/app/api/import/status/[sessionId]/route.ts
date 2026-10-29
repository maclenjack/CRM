import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getImportRecordCounts, getImportSession } from '@/features/shared/import/import-session';
import {
  ImportEntityType,
  ImportRecordStatus,
  ImportSessionStatus,
} from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await context.params;

    const importSession = await getImportSession(sessionId);

    if (!importSession) {
      return NextResponse.json(
        { error: 'Import session not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (importSession.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recordCounts = await getImportRecordCounts(sessionId);

    // Get per-entity-type counts from DB
    const entityTypes = [
      ImportEntityType.ORGANIZATION,
      ImportEntityType.PERSON,
      ImportEntityType.DEAL,
      ImportEntityType.ACTIVITY,
    ];
    const entityCounts: Record<string, Record<ImportRecordStatus, number>> = {};

    for (const entityType of entityTypes) {
      const counts = await prisma.importRecord.groupBy({
        by: ['status'],
        where: { sessionId, entityType },
        _count: { status: true },
      });

      entityCounts[entityType] = counts.reduce(
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

    // Calculate overall progress from DB counts
    const totalRecords = Object.values(recordCounts).reduce(
      (sum, count) => sum + count,
      0
    );
    const completedRecords =
      recordCounts.CREATED + recordCounts.UPDATED + recordCounts.SKIPPED;
    const progress =
      totalRecords > 0
        ? Math.round((completedRecords / totalRecords) * 100)
        : 0;

    // Calculate per-entity progress from database counts
    const entityProgress: Record<
      string,
      {
        percentage: number;
        total: number;
        completed: number;
        created: number;
        updated: number;
        skipped: number;
        failed: number;
      }
    > = {};
    for (const entityType of entityTypes) {
      const counts = entityCounts[entityType];
      const total = Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
      );
      const completed =
        (counts.CREATED || 0) + (counts.UPDATED || 0) + (counts.SKIPPED || 0);
      entityProgress[entityType] = {
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        total,
        completed,
        created: counts.CREATED || 0,
        updated: counts.UPDATED || 0,
        skipped: counts.SKIPPED || 0,
        failed: counts.FAILED || 0,
      };
    }

    // Override with real-time progress from DB entityProgress JSON if available
    if (importSession.entityProgress) {
      const dbEntityProgress = importSession.entityProgress as Record<string, {
        total: number;
        processed: number;
        percentage: number;
        created: number;
        updated: number;
        skipped: number;
        failed: number;
      }>;
      for (const [entityType, entityData] of Object.entries(dbEntityProgress)) {
        entityProgress[entityType] = {
          percentage: entityData.percentage,
          total: entityData.total,
          completed: entityData.processed,
          created: entityData.created,
          updated: entityData.updated,
          skipped: entityData.skipped,
          failed: entityData.failed,
        };
      }
    }

    // Determine current phase
    let currentPhase = 'pending';
    const isTerminalState =
      importSession.status === ImportSessionStatus.COMPLETED ||
      importSession.status === ImportSessionStatus.FAILED ||
      importSession.status === ImportSessionStatus.ROLLED_BACK;

    if (isTerminalState) {
      if (importSession.status === ImportSessionStatus.COMPLETED) {
        currentPhase = 'complete';
      } else if (importSession.status === ImportSessionStatus.FAILED) {
        currentPhase = 'failed';
      } else if (importSession.status === ImportSessionStatus.ROLLED_BACK) {
        currentPhase = 'rolled_back';
      }
    } else if (importSession.status === ImportSessionStatus.RUNNING) {
      // Use currentPhase from DB if available, otherwise infer from records
      if (importSession.currentPhase) {
        currentPhase = importSession.currentPhase;
      } else {
        const records = importSession.records;
        if (records.some((r) => r.entityType === 'ACTIVITY'))
          currentPhase = 'activities';
        else if (records.some((r) => r.entityType === 'DEAL'))
          currentPhase = 'deals';
        else if (records.some((r) => r.entityType === 'PERSON'))
          currentPhase = 'people';
        else if (records.some((r) => r.entityType === 'ORGANIZATION'))
          currentPhase = 'organizations';
      }
    }

    // Calculate overall progress using fixed totalRecords from session (set upfront with all entity totals)
    // and completed from entityProgress (real-time per-entity progress)
    let progressFinal: number;
    if (importSession.status === ImportSessionStatus.COMPLETED) {
      progressFinal = 100;
    } else {
      // Sum completed across all entities from entityProgress
      let grandCompleted = 0;
      for (const entityData of Object.values(entityProgress)) {
        grandCompleted += entityData.completed || 0;
      }
      // Use session.totalRecords as fixed denominator (calculated upfront with all entities)
      const grandTotal = importSession.totalRecords || 0;
      progressFinal =
        grandTotal > 0
          ? Math.min(100, Math.round((grandCompleted / grandTotal) * 100))
          : 0;
    }

    return NextResponse.json({
      session: {
        id: importSession.id,
        source: importSession.source,
        status: importSession.status,
        fileName: importSession.fileName,
        fileSize: importSession.fileSize,
        rowCount: importSession.rowCount,
        errorCount: importSession.errorCount,
        createdAt: importSession.createdAt,
        completedAt: importSession.completedAt,
      },
      progress: {
        phase: currentPhase,
        percentage: progressFinal,
        totalRecords,
        completedRecords,
        failedRecords: recordCounts.FAILED,
      },
      entityProgress,
      entityCounts,
      counts: recordCounts,
    });
  } catch (error) {
    console.error('Import status error:', error);
    return NextResponse.json(
      { error: 'Failed to get import status' },
      { status: 500 }
    );
  }
}
