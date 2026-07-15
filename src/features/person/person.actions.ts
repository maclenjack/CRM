'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import type { PersonFormValues } from '@/features/person/person.validation';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import type { PersonModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

export async function createPersonAction(data: PersonFormValues) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  console.log('creating person');

  const phones = data.phones.filter((p) => p.value.trim() !== '');
  const emails = data.emails.filter((e) => e.value.trim() !== '');

  try {
    await prisma.person.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        ownerId: session.user.id,
        phones: {
          create: phones.map((p) => ({ phone: p.value, category: p.type })),
        },
        emails: {
          create: emails.map((e) => ({ email: e.value, category: e.type })),
        },
        createdById: session.user.id,
      },
    });

    revalidatePath('/contacts/people');

    return { success: true };
  } catch (err) {
    console.error('Create person error', err);
    return { success: false, message: 'Failed to create person' };
  }
}

export const searchPeople = createSearchAction<PersonModel>(prisma.person, {
  searchField: 'name',
  selectFields: {
    id: true,
    name: true,
    emails: { select: { email: true } },
  } as any,
  limit: 15,
});
