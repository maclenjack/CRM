'use server';

import { revalidatePath } from 'next/cache';

import {
  DeletePersonSchema,
  PersonFormSchema,
} from '@/features/person/person.validation';
import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import prisma from '@/lib/prisma';

const PEOPLE_PATH = '/contacts/people';

export async function createPerson(rawInput: unknown) {
  return actionPipeline({
    schema: PersonFormSchema,
    rawInput,
    actionName: 'CreatePerson',
    handler: async (data, userId) => {
      const phones = data.phones.filter((p) => p.value.trim() !== '');
      const emails = data.emails.filter((e) => e.value.trim() !== '');

      const newPerson = await prisma.person.create({
        data: {
          name: data.name,
          organizationId: data.organizationId || null,
          ownerId: userId,
          phones: {
            create: phones.map((p) => ({ phone: p.value, category: p.type })),
          },
          emails: {
            create: emails.map((e) => ({ email: e.value, category: e.type })),
          },
          createdById: userId,
        },
      });

      revalidatePath(PEOPLE_PATH);
      return { id: newPerson.id };
    },
  });
}

export async function updatePerson(personId: string, rawInput: unknown) {
  return actionPipeline({
    schema: PersonFormSchema,
    rawInput,
    actionName: 'UpdatePerson',
    handler: async (data, userId) => {
      const phones = data.phones.filter((p) => p.value.trim() !== '');
      const emails = data.emails.filter((e) => e.value.trim() !== '');

      await prisma.person.update({
        where: { id: personId, ownerId: userId },
        data: {
          name: data.name,
          organizationId: data.organizationId || null,
          phones: {
            deleteMany: {},
            create: phones.map((p) => ({
              phone: p.value,
              category: p.type,
            })),
          },
          emails: {
            deleteMany: {},
            create: emails.map((e) => ({
              email: e.value,
              category: e.type,
            })),
          },
          updatedById: userId,
        },
      });

      revalidatePath(PEOPLE_PATH);
      revalidatePath('/activities');
      return { id: personId };
    },
  });
}

export async function deletePerson(id: string) {
  return actionPipeline({
    schema: DeletePersonSchema,
    rawInput: { id },
    actionName: 'DeletePerson',
    handler: async ({ id: personId }, userId) => {
      await prisma.person.update({
        where: { id: personId, ownerId: userId },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
        },
      });

      revalidatePath(PEOPLE_PATH);
      return { id: personId };
    },
  });
}

export const searchPeople = createSearchAction<
  { id: string; name: string; emails: { email: string }[] },
  typeof prisma.person
>(prisma.person, {
  searchField: 'name',
  selectFields: {
    id: true,
    name: true,
    emails: { select: { email: true } },
  },
  limit: 15,
});
