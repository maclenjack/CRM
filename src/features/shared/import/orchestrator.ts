import type { Prisma } from '@/generated/prisma/client';
import {
  ImportEntityType,
  ImportSessionStatus,
} from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

import { importActivities } from './import-activities';
import { importDeals } from './import-deals';
import { importOrganizations } from './import-organizations';
import { importPeople } from './import-people';
import { buildExternalIdMap, updateImportSession } from './import-session';

// Export helper functions for external use
export { calculateTotalRecords, getEntityCount, updateProgressInDb };

export interface ImportOrchestratorOptions {
  sessionId: string;
  userId: string;
  organizationsCsv?: string;
  peopleCsv?: string;
  dealsCsv?: string;
  activitiesCsv?: string;
  onProgress?: (progress: ImportProgress) => void;
  debug?: boolean;
  tx?: Prisma.TransactionClient;
}

export interface ImportProgress {
  phase: 'organizations' | 'people' | 'deals' | 'activities' | 'complete';
  current: number;
  total: number;
  message: string;
  currentEntityType?: string;
  currentEntityProcessed?: number;
  currentEntityTotal?: number;
}

export interface ImportResult {
  sessionId: string;
  organizations: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  people: { created: number; updated: number; skipped: number; failed: number };
  deals: { created: number; updated: number; skipped: number; failed: number };
  activities: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  totalErrors: number;
}

function debugLog(debug: boolean | undefined, ...args: unknown[]) {
  if (debug) {
    console.log('[IMPORT DEBUG]', new Date().toISOString(), ...args);
  }
}

// Helper to update progress in database (replaces in-memory progress store)
// Uses main prisma client directly so updates are visible immediately (outside transaction)
async function updateProgressInDb(
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
  }
) {
  const { entityProgress, ...dbData } = data;
  await prisma.importSession.update({
    where: { id: sessionId },
    data: {
      ...dbData,
      entityProgress: entityProgress as Prisma.InputJsonValue,
    },
  });
}

/**
 * Calculate total records from CSV strings
 */
async function calculateTotalRecords(
  organizationsCsv?: string,
  peopleCsv?: string,
  dealsCsv?: string,
  activitiesCsv?: string
): Promise<number> {
  const { parseCSVString } = await import('./csv-parser');
  let total = 0;
  if (organizationsCsv) {
    const { data: rows } =
      await parseCSVString<Record<string, string>>(organizationsCsv);
    total += rows.length;
  }
  if (peopleCsv) {
    const { data: rows } =
      await parseCSVString<Record<string, string>>(peopleCsv);
    total += rows.length;
  }
  if (dealsCsv) {
    const { data: rows } =
      await parseCSVString<Record<string, string>>(dealsCsv);
    total += rows.length;
  }
  if (activitiesCsv) {
    const { data: rows } =
      await parseCSVString<Record<string, string>>(activitiesCsv);
    total += rows.length;
  }
  return total;
}

/**
 * Get entity count from CSV
 */
async function getEntityCount(csv?: string): Promise<number> {
  if (!csv) return 0;
  const { parseCSVString } = await import('./csv-parser');
  const { data: rows } = await parseCSVString<Record<string, string>>(csv);
  return rows.length;
}

/**
 * Import organizations phase
 */
async function importOrganizationsPhase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  sessionId: string,
  userId: string,
  organizationsCsv: string,
  debug: boolean | undefined,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  cumulativeProcessed: { value: number },
  totalRecords: number
): Promise<ImportResult['organizations']> {
  const orgTotal = await getEntityCount(organizationsCsv);
  onProgress?.({
    phase: 'organizations',
    current: 0,
    total: 1,
    message: 'Importing organizations...',
    currentEntityType: 'ORGANIZATION',
    currentEntityProcessed: 0,
    currentEntityTotal: orgTotal,
  });
  debugLog(debug, 'Starting organizations import');

  // Track counts locally for real-time progress
  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  // Initial progress update with zero counts
  await updateProgressInDb(sessionId, {
    currentEntityProcessed: 0,
    currentEntityTotal: orgTotal,
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      ORGANIZATION: {
        total: orgTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
    },
  });

  const orgResult = await importOrganizations(
    sessionId,
    userId,
    organizationsCsv,
    debug,
    async (processed, total, counts) => {
      cumulativeProcessed.value += 1;
      // Update local counts from the import function
      created = counts.created;
      updated = counts.updated;
      skipped = counts.skipped;
      failed = counts.failed;

      await updateProgressInDb(sessionId, {
        currentEntityProcessed: processed,
        currentEntityTotal: total,
        processedRecords: cumulativeProcessed.value,
        totalRecords,
        entityProgress: {
          ORGANIZATION: {
            total: total,
            processed: processed,
            percentage: total > 0 ? Math.round((processed / total) * 100) : 0,
            created,
            updated,
            skipped,
            failed,
          },
        },
      });
      onProgress?.({
        phase: 'organizations',
        current: processed,
        total: total,
        message: `Importing organizations... (${processed}/${total})`,
        currentEntityType: 'ORGANIZATION',
        currentEntityProcessed: processed,
        currentEntityTotal: total,
      });
    },
    tx
  );

  // Update counts from result
  created = orgResult.created;
  updated = orgResult.updated;
  skipped = orgResult.skipped;
  failed = orgResult.failed;

  // Final update with complete counts
  await updateProgressInDb(sessionId, {
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      ORGANIZATION: {
        total: orgTotal,
        processed: orgTotal,
        percentage: 100,
        created,
        updated,
        skipped,
        failed,
      },
    },
  });

  debugLog(debug, 'Organizations import complete', orgResult);
  return orgResult;
}

/**
 * Import people phase
 */
async function importPeoplePhase(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  sessionId: string,
  userId: string,
  peopleCsv: string,
  orgIdMap: Map<string, string>,
  debug: boolean | undefined,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  cumulativeProcessed: { value: number },
  totalRecords: number
): Promise<ImportResult['people']> {
  const peopleTotal = await getEntityCount(peopleCsv);
  onProgress?.({
    phase: 'people',
    current: 0,
    total: 1,
    message: 'Importing people...',
    currentEntityType: 'PERSON',
    currentEntityProcessed: 0,
    currentEntityTotal: peopleTotal,
  });
  debugLog(debug, 'Starting people import');

  await updateProgressInDb(sessionId, {
    currentPhase: 'people',
    currentEntityType: 'PERSON',
    currentEntityProcessed: 0,
    currentEntityTotal: peopleTotal,
    totalRecords,
  });

  // Track counts locally for real-time progress
  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  // Initial progress update with zero counts
  await updateProgressInDb(sessionId, {
    currentEntityProcessed: 0,
    currentEntityTotal: peopleTotal,
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      PERSON: {
        total: peopleTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
    },
  });

  const peopleResult = await importPeople(
    sessionId,
    userId,
    peopleCsv,
    orgIdMap,
    debug,
    async (processed, total, counts) => {
      cumulativeProcessed.value += 1;
      // Update local counts from the import function
      created = counts.created;
      updated = counts.updated;
      skipped = counts.skipped;
      failed = counts.failed;

      await updateProgressInDb(sessionId, {
        currentEntityProcessed: processed,
        currentEntityTotal: total,
        processedRecords: cumulativeProcessed.value,
        totalRecords,
        entityProgress: {
          PERSON: {
            total: total,
            processed: processed,
            percentage: total > 0 ? Math.round((processed / total) * 100) : 0,
            created,
            updated,
            skipped,
            failed,
          },
        },
      });
      onProgress?.({
        phase: 'people',
        current: processed,
        total: total,
        message: `Importing people... (${processed}/${total})`,
        currentEntityType: 'PERSON',
        currentEntityProcessed: processed,
        currentEntityTotal: total,
      });
    },
    tx
  );

  // Update counts from result
  created = peopleResult.created;
  updated = peopleResult.updated;
  skipped = peopleResult.skipped;
  failed = peopleResult.failed;

  // Final update with complete counts
  await updateProgressInDb(sessionId, {
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      PERSON: {
        total: peopleTotal,
        processed: peopleTotal,
        percentage: 100,
        created,
        updated,
        skipped,
        failed,
      },
    },
  });

  debugLog(debug, 'People import complete', peopleResult);
  return peopleResult;
}

/**
 * Import deals phase
 */
async function importDealsPhase(
  sessionId: string,
  userId: string,
  dealsCsv: string,
  personIdMap: Map<string, string>,
  orgIdMap: Map<string, string>,
  debug: boolean | undefined,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  cumulativeProcessed: { value: number },
  totalRecords: number
): Promise<ImportResult['deals']> {
  const dealsTotal = await getEntityCount(dealsCsv);
  onProgress?.({
    phase: 'deals',
    current: 0,
    total: 1,
    message: 'Importing deals...',
    currentEntityType: 'DEAL',
    currentEntityProcessed: 0,
    currentEntityTotal: dealsTotal,
  });
  debugLog(debug, 'Starting deals import');

  // Track counts locally for real-time progress
  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  // Initial progress update with zero counts
  await updateProgressInDb(sessionId, {
    currentPhase: 'deals',
    currentEntityType: 'DEAL',
    currentEntityProcessed: 0,
    currentEntityTotal: dealsTotal,
    totalRecords,
    entityProgress: {
      DEAL: {
        total: dealsTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
    },
  });

  const dealsResult = await importDeals(
    sessionId,
    userId,
    dealsCsv,
    personIdMap,
    orgIdMap,
    debug,
    async (processed, total, counts) => {
      cumulativeProcessed.value += 1;
      // Update local counts from the import function
      created = counts.created;
      updated = counts.updated;
      skipped = counts.skipped;
      failed = counts.failed;

      await updateProgressInDb(sessionId, {
        currentEntityProcessed: processed,
        currentEntityTotal: total,
        processedRecords: cumulativeProcessed.value,
        totalRecords,
        entityProgress: {
          DEAL: {
            total: total,
            processed: processed,
            percentage: total > 0 ? Math.round((processed / total) * 100) : 0,
            created,
            updated,
            skipped,
            failed,
          },
        },
      });
      onProgress?.({
        phase: 'deals',
        current: processed,
        total: total,
        message: `Importing deals... (${processed}/${total})`,
        currentEntityType: 'DEAL',
        currentEntityProcessed: processed,
        currentEntityTotal: total,
      });
    }
  );

  // Update counts from result
  created = dealsResult.created;
  updated = dealsResult.updated;
  skipped = dealsResult.skipped;
  failed = dealsResult.failed;

  // Final update with complete counts
  await updateProgressInDb(sessionId, {
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      DEAL: {
        total: dealsTotal,
        processed: dealsTotal,
        percentage: 100,
        created,
        updated,
        skipped,
        failed,
      },
    },
  });

  debugLog(debug, 'Deals import complete', dealsResult);
  return dealsResult;
}

/**
 * Import activities phase
 */
async function importActivitiesPhase(
  sessionId: string,
  userId: string,
  activitiesCsv: string,
  dealIdMap: Map<string, string>,
  personIdMap: Map<string, string>,
  orgIdMap: Map<string, string>,
  debug: boolean | undefined,
  onProgress: ((progress: ImportProgress) => void) | undefined,
  cumulativeProcessed: { value: number },
  totalRecords: number
): Promise<ImportResult['activities']> {
  const activitiesTotal = await getEntityCount(activitiesCsv);
  onProgress?.({
    phase: 'activities',
    current: 0,
    total: 1,
    message: 'Importing activities...',
    currentEntityType: 'ACTIVITY',
    currentEntityProcessed: 0,
    currentEntityTotal: activitiesTotal,
  });
  debugLog(debug, 'Starting activities import');

  // Track counts locally for real-time progress
  let created = 0,
    updated = 0,
    skipped = 0,
    failed = 0;

  // Initial progress update with zero counts
  await updateProgressInDb(sessionId, {
    currentPhase: 'activities',
    currentEntityType: 'ACTIVITY',
    currentEntityProcessed: 0,
    currentEntityTotal: activitiesTotal,
    totalRecords,
    entityProgress: {
      ACTIVITY: {
        total: activitiesTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
    },
  });

  const activitiesResult = await importActivities(
    sessionId,
    userId,
    activitiesCsv,
    dealIdMap,
    personIdMap,
    orgIdMap,
    debug,
    async (processed, total, counts) => {
      cumulativeProcessed.value += 1;
      // Update local counts from the import function
      created = counts.created;
      updated = counts.updated;
      skipped = counts.skipped;
      failed = counts.failed;

      await updateProgressInDb(sessionId, {
        currentEntityProcessed: processed,
        currentEntityTotal: total,
        processedRecords: cumulativeProcessed.value,
        totalRecords,
        entityProgress: {
          ACTIVITY: {
            total: total,
            processed: processed,
            percentage: total > 0 ? Math.round((processed / total) * 100) : 0,
            created,
            updated,
            skipped,
            failed,
          },
        },
      });
      onProgress?.({
        phase: 'activities',
        current: processed,
        total: total,
        message: `Importing activities... (${processed}/${total})`,
        currentEntityType: 'ACTIVITY',
        currentEntityProcessed: processed,
        currentEntityTotal: total,
      });
    }
  );

  // Update counts from result
  created = activitiesResult.created;
  updated = activitiesResult.updated;
  skipped = activitiesResult.skipped;
  failed = activitiesResult.failed;

  // Final update with complete counts
  await updateProgressInDb(sessionId, {
    processedRecords: cumulativeProcessed.value,
    totalRecords,
    entityProgress: {
      ACTIVITY: {
        total: activitiesTotal,
        processed: activitiesTotal,
        percentage: 100,
        created,
        updated,
        skipped,
        failed,
      },
    },
  });

  debugLog(debug, 'Activities import complete', activitiesResult);
  return activitiesResult;
}

/**
 * Build ID map for an entity type
 */
async function buildIdMap(
  sessionId: string,
  entityType: ImportEntityType,
  tx?: Prisma.TransactionClient
): Promise<Map<string, string>> {
  const map = await buildExternalIdMap(sessionId, entityType, tx);
  const result = new Map<string, string>();
  for (const [ext, int] of map) result.set(ext, int);
  return result;
}

/**
 * Main orchestrator function - runs the full import pipeline
 */
export async function runImportPipeline(
  options: ImportOrchestratorOptions
): Promise<ImportResult> {
  const {
    sessionId,
    userId,
    organizationsCsv,
    peopleCsv,
    dealsCsv,
    activitiesCsv,
    onProgress,
    debug,
    tx: providedTx,
  } = options;

  debugLog(debug, 'Starting import pipeline', {
    sessionId,
    userId,
    hasOrgs: !!organizationsCsv,
    hasPeople: !!peopleCsv,
    hasDeals: !!dealsCsv,
    hasActivities: !!activitiesCsv,
  });

  // Initialize result counters
  const result: ImportResult = {
    sessionId,
    organizations: { created: 0, updated: 0, skipped: 0, failed: 0 },
    people: { created: 0, updated: 0, skipped: 0, failed: 0 },
    deals: { created: 0, updated: 0, skipped: 0, failed: 0 },
    activities: { created: 0, updated: 0, skipped: 0, failed: 0 },
    totalErrors: 0,
  };

  // Use provided transaction client or default prisma
  const client = (providedTx || prisma) as any;

  try {
    // Run pipeline without transaction for live progress visibility
    // Imports are idempotent - failed imports can be retried
    const result: ImportResult = {
      sessionId,
      organizations: { created: 0, updated: 0, skipped: 0, failed: 0 },
      people: { created: 0, updated: 0, skipped: 0, failed: 0 },
      deals: { created: 0, updated: 0, skipped: 0, failed: 0 },
      activities: { created: 0, updated: 0, skipped: 0, failed: 0 },
      totalErrors: 0,
    };

    // ID maps for cross-entity resolution
    const orgIdMap = new Map<string, string>();
    const personIdMap = new Map<string, string>();
    const dealIdMap = new Map<string, string>();

    // Check idempotency - prevent duplicate processing
    const existingSession = await prisma.importSession.findUnique({
      where: { id: sessionId },
    });
    if (
      existingSession &&
      existingSession.status === ImportSessionStatus.COMPLETED
    ) {
      debugLog(debug, 'Import session already completed, skipping', {
        sessionId,
      });
      return {
        sessionId,
        organizations: { created: 0, updated: 0, skipped: 0, failed: 0 },
        people: { created: 0, updated: 0, skipped: 0, failed: 0 },
        deals: { created: 0, updated: 0, skipped: 0, failed: 0 },
        activities: { created: 0, updated: 0, skipped: 0, failed: 0 },
        totalErrors: 0,
      };
    }

    // Update session to RUNNING
    await prisma.importSession.update({
      where: { id: sessionId },
      data: { status: ImportSessionStatus.RUNNING },
    });
    debugLog(debug, 'Session status updated to RUNNING');

    // Calculate total records upfront for progress tracking
    const totalRecords = await calculateTotalRecords(
      organizationsCsv,
      peopleCsv,
      dealsCsv,
      activitiesCsv
    );

    // Pre-calculate entity totals for seeding entityProgress
    const orgTotal = await getEntityCount(organizationsCsv);
    const peopleTotal = await getEntityCount(peopleCsv);
    const dealsTotal = await getEntityCount(dealsCsv);
    const activitiesTotal = await getEntityCount(activitiesCsv);

    // Track cumulative processed records across all entities
    const cumulativeProcessed = { value: 0 };

    // Seed entityProgress for all entities so status API has data immediately
    const initialEntityProgress = {
      ORGANIZATION: {
        total: orgTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
      PERSON: {
        total: peopleTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
      DEAL: {
        total: dealsTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
      ACTIVITY: {
        total: activitiesTotal,
        processed: 0,
        percentage: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
      },
    };

    await updateProgressInDb(sessionId, {
      currentPhase: 'organizations',
      totalRecords,
      processedRecords: 0,
      currentEntityType: 'ORGANIZATION',
      currentEntityProcessed: 0,
      currentEntityTotal: orgTotal,
      entityProgress: initialEntityProgress,
    });

    // Phase 1: Organizations
    if (organizationsCsv) {
      result.organizations = await importOrganizationsPhase(
        prisma,
        sessionId,
        userId,
        organizationsCsv,
        debug,
        onProgress,
        cumulativeProcessed,
        totalRecords
      );

      // Build org ID map for next phases
      const map = await buildIdMap(sessionId, ImportEntityType.ORGANIZATION);
      for (const [ext, int] of map) orgIdMap.set(ext, int);
    }

    // Phase 2: People
    if (peopleCsv) {
      result.people = await importPeoplePhase(
        prisma,
        sessionId,
        userId,
        peopleCsv,
        orgIdMap,
        debug,
        onProgress,
        cumulativeProcessed,
        totalRecords
      );

      // Build person ID map for next phases
      const map = await buildIdMap(sessionId, ImportEntityType.PERSON);
      for (const [ext, int] of map) personIdMap.set(ext, int);
    }

    // Phase 3: Deals
    if (dealsCsv) {
      result.deals = await importDealsPhase(
        sessionId,
        userId,
        dealsCsv,
        personIdMap,
        orgIdMap,
        debug,
        onProgress,
        cumulativeProcessed,
        totalRecords
      );

      // Build deal ID map for next phases
      const map = await buildIdMap(sessionId, ImportEntityType.DEAL);
      for (const [ext, int] of map) dealIdMap.set(ext, int);
    }

    // Phase 4: Activities
    if (activitiesCsv) {
      result.activities = await importActivitiesPhase(
        sessionId,
        userId,
        activitiesCsv,
        dealIdMap,
        personIdMap,
        orgIdMap,
        debug,
        onProgress,
        cumulativeProcessed,
        totalRecords
      );
    }

    // Calculate total errors
    result.totalErrors =
      result.organizations.failed +
      result.people.failed +
      result.deals.failed +
      result.activities.failed;

    // Update session to COMPLETED
    await prisma.importSession.update({
      where: { id: sessionId },
      data: {
        status: ImportSessionStatus.COMPLETED,
        completedAt: new Date(),
        errorCount: result.totalErrors,
      },
    });
    debugLog(debug, 'Session status updated to COMPLETED', {
      totalErrors: result.totalErrors,
    });

    // Update database to reflect completion
    await updateProgressInDb(sessionId, {
      currentPhase: 'complete',
      processedRecords: totalRecords,
      currentEntityType: '',
      currentEntityProcessed: 0,
      currentEntityTotal: 0,
    });

    onProgress?.({
      phase: 'complete',
      current: 1,
      total: 1,
      message: 'Import completed!',
    });

    debugLog(debug, 'Import pipeline completed successfully', result);
    return result;
  } catch (error) {
    debugLog(debug, 'Import pipeline failed', error);
    // Update session to FAILED
    await prisma.importSession.update({
      where: { id: sessionId },
      data: {
        status: ImportSessionStatus.FAILED,
        completedAt: new Date(),
        errorCount: result.totalErrors,
      },
    });
    throw error;
  }
}
