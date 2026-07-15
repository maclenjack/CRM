'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import { ActivityFormSchema } from '@/features/activity/activity.validation';
import prisma from '@/lib/prisma';

export async function createActivity(rawInput: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  const parseResult = ActivityFormSchema.safeParse(rawInput);

  if (!parseResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data = parseResult.data;

  try {
    await prisma.activity.create({
      data: {
        subject: data.subject,
        type: data.type,
        priority: data.priority,
        startDate: data.startDateTime,
        endDate: data.endDateTime,
        dealId: data.dealId,
        personId: data.personId,
        organizationId: data.organizationId,
        ownerId: session.user.id,
        createdById: session.user.id,
        updatedById: session.user.id,
        notes: data.note
          ? {
              create: {
                content: data.note,
                createdById: session.user.id,
                updatedById: session.user.id,
              },
            }
          : undefined,
      },
    });

    revalidatePath('/activities');

    return { success: true };
  } catch (error) {
    console.error('Failed to create activity:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
