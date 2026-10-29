'use server';

import { revalidatePath } from 'next/cache';

import {
  DeleteOrganizationSchema,
  OrganizationFormSchema,
} from '@/features/organization/organization.validation';
import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import type { OrganizationModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

const ORGANIZATIONS_PATH = '/contacts/organizations';

export async function createOrganization(rawInput: unknown) {
  return actionPipeline({
    schema: OrganizationFormSchema,
    rawInput,
    actionName: 'CreateOrganization',
    handler: async (data, userId) => {
      await prisma.organization.create({
        data: {
          name: data.name,
          ownerId: userId,
          createdById: userId,
          updatedById: userId,
        },
      });

      revalidatePath(ORGANIZATIONS_PATH);
      return { id: 'created' };
    },
  });
}

export async function updateOrganization(id: string, rawInput: unknown) {
  return actionPipeline({
    schema: OrganizationFormSchema,
    rawInput,
    actionName: 'UpdateOrganization',
    handler: async (data, userId) => {
      await prisma.organization.update({
        where: { id, ownerId: userId },
        data: {
          name: data.name,
          updatedById: userId,
        },
      });

      revalidatePath(ORGANIZATIONS_PATH);
      return { id };
    },
  });
}

export async function deleteOrganization(id: string) {
  return actionPipeline({
    schema: DeleteOrganizationSchema,
    rawInput: { id },
    actionName: 'DeleteOrganization',
    handler: async ({ id: orgId }, userId) => {
      await prisma.organization.update({
        where: { id: orgId, ownerId: userId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
        },
      });

      revalidatePath(ORGANIZATIONS_PATH);
      return { id: orgId };
    },
  });
}

export const searchOrganizations = createSearchAction<
  OrganizationModel,
  typeof prisma.organization
>(prisma.organization, {
  searchField: 'name',
  selectFields: { id: true, name: true },
  limit: 15,
});
