'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import type { OrganizationFormValues } from '@/features/organization/organization.validation';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import type { OrganizationModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

export const searchOrganizations = createSearchAction<OrganizationModel>(
  prisma.organization,
  {
    searchField: 'name',
    selectFields: { id: true, name: true } as any,
    limit: 15,
  }
);

export async function createOrganization(formData: OrganizationFormValues) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  try {
    await prisma.organization.create({
      data: {
        name: formData.name,
        ownerId: session.user.id,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    revalidatePath('/contacts/organizations');

    return { success: true };
  } catch (error) {
    console.error('Failed to create activity:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
