import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { validateActivitiesCsv } from '@/features/activity/import.actions';
import { validateDealsCsv } from '@/features/deal/import.actions';
import { validateOrganizationsCsv } from '@/features/organization/import.actions';
import { validatePeopleCsv } from '@/features/person/import.actions';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const entityType = formData.get('entityType') as string;
    const file = formData.get('file') as File;

    if (!entityType || !file) {
      return NextResponse.json(
        { error: 'entityType and file are required' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Call appropriate validation action
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
        return NextResponse.json(
          { error: `Unknown entity type: ${entityType}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, validationErrors: result.validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Import validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
