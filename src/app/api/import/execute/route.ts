import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { createImportSession } from '@/features/shared/import/import-session';
import { runImportPipeline } from '@/features/shared/import/orchestrator';
import { updateProgressInDb } from '@/features/shared/import/orchestrator';
import { ImportSource } from '@/generated/prisma/enums';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const organizationsFile = formData.get('organizations') as File | null;
    const peopleFile = formData.get('people') as File | null;
    const dealsFile = formData.get('deals') as File | null;
    const activitiesFile = formData.get('activities') as File | null;

    // At least one file is required
    if (!organizationsFile && !peopleFile && !dealsFile && !activitiesFile) {
      return NextResponse.json(
        { error: 'At least one CSV file is required' },
        { status: 400 }
      );
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

    // Calculate totals and seed initial progress BEFORE starting pipeline
    const { calculateTotalRecords, getEntityCount } = await import('@/features/shared/import/orchestrator');
    const totalRecords = await calculateTotalRecords(organizationsCsv, peopleCsv, dealsCsv, activitiesCsv);
    const orgTotal = await getEntityCount(organizationsCsv);
    const peopleTotal = await getEntityCount(peopleCsv);
    const dealsTotal = await getEntityCount(dealsCsv);
    const activitiesTotal = await getEntityCount(activitiesCsv);

    const initialEntityProgress = {
      ORGANIZATION: { total: orgTotal, processed: 0, percentage: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
      PERSON: { total: peopleTotal, processed: 0, percentage: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
      DEAL: { total: dealsTotal, processed: 0, percentage: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
      ACTIVITY: { total: activitiesTotal, processed: 0, percentage: 0, created: 0, updated: 0, skipped: 0, failed: 0 },
    };

    // Seed initial progress in database BEFORE starting pipeline
    await prisma.importSession.update({
      where: { id: importSession.id },
      data: {
        currentPhase: 'organizations',
        totalRecords,
        processedRecords: 0,
        currentEntityType: 'ORGANIZATION',
        currentEntityProcessed: 0,
        currentEntityTotal: orgTotal,
        entityProgress: initialEntityProgress as any,
      },
    });

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

    return NextResponse.json({
      sessionId: importSession.id,
      status: 'started',
      message: 'Import started. Poll /api/import/status/[sessionId] for progress.',
    });
  } catch (error) {
    console.error('Import execution error:', error);
    return NextResponse.json(
      { error: 'Import failed to start' },
      { status: 500 }
    );
  }
}
