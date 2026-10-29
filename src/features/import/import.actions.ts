'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { validateActivitiesCsv } from '@/features/activity/import.actions';
import { validateDealsCsv } from '@/features/deal/import.actions';
import { validateOrganizationsCsv } from '@/features/organization/import.actions';
import { validatePeopleCsv } from '@/features/person/import.actions';
import { createImportSession } from '@/features/shared/import/import-session';
import { runImportPipeline } from '@/features/shared/import/orchestrator';
import { ImportSource } from '@/generated/prisma/enums';

export interface ImportValidationResult {
  preview: any[];
  errors: any[];
  validCount: number;
  invalidCount: number;
}

export interface ImportExecuteResult {
  sessionId: string;
  status: string;
  message: string;
}

/**
 * Validate a CSV file for import
 */
export async function validateImportFile(
  entityType: string,
  file: File
): Promise<ImportValidationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const csvContent = await file.text();

  let result;
  switch (entityType) {
    case 'organizations':
      result = await validateOrganizationsCsv({ csvContent });
      break;
    case 'people':
      result = await validatePeopleCsv({ csvContent });
      break;
    case 'deals':
      result = await validateDealsCsv({ csvContent });
      break;
    case 'activities':
      result = await validateActivitiesCsv({ csvContent });
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  if (!result.success) {
    throw new Error(result.error || 'Validation failed');
  }

  return {
    preview: result.data.preview,
    errors: result.data.errors,
    validCount: result.data.validCount,
    invalidCount: result.data.invalidCount,
  };
}

/**
 * Execute the import pipeline
 */
export async function executeImport(
  files: Record<string, File | null>
): Promise<ImportExecuteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const organizationsFile = files.organizations || null;
  const peopleFile = files.people || null;
  const dealsFile = files.deals || null;
  const activitiesFile = files.activities || null;

  // At least one file is required
  if (!organizationsFile && !peopleFile && !dealsFile && !activitiesFile) {
    throw new Error('At least one CSV file is required');
  }

  // Create import session
  const importSession = await createImportSession({
    source: ImportSource.PIPEDRIVE,
    fileName:
      organizationsFile?.name ||
      peopleFile?.name ||
      dealsFile?.name ||
      activitiesFile?.name,
    fileSize:
      (organizationsFile?.size || 0) +
      (peopleFile?.size || 0) +
      (dealsFile?.size || 0) +
      (activitiesFile?.size || 0),
    createdById: session.user.id,
  });

  // Read file contents
  const organizationsCsv = organizationsFile
    ? await organizationsFile.text()
    : undefined;
  const peopleCsv = peopleFile ? await peopleFile.text() : undefined;
  const dealsCsv = dealsFile ? await dealsFile.text() : undefined;
  const activitiesCsv = activitiesFile
    ? await activitiesFile.text()
    : undefined;

  // Run import pipeline asynchronously (don't await)
  runImportPipeline({
    sessionId: importSession.id,
    userId: session.user.id,
    organizationsCsv,
    peopleCsv,
    dealsCsv,
    activitiesCsv,
    debug: true,
  }).catch((error) => {
    console.error('Import pipeline failed:', error);
  });

  return {
    sessionId: importSession.id,
    status: 'started',
    message:
      'Import started. Poll /api/import/status/[sessionId] for progress.',
  };
}
