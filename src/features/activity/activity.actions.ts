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

export async function updateActivity(id: string, rawInput: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  const parseResult = ActivityFormSchema.partial().safeParse(rawInput);

  if (!parseResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data = parseResult.data;

  try {
    await prisma.activity.update({
      where: { id, ownerId: session.user.id },
      data: {
        subject: data.subject,
        type: data.type,
        priority: data.priority,
        startDate: data.startDateTime,
        endDate: data.endDateTime,
        dealId: data.dealId,
        personId: data.personId,
        organizationId: data.organizationId,
        isDone: data.isDone,
        updatedById: session.user.id,
      },
    });

    revalidatePath('/activities');

    return { success: true };
  } catch (error) {
    console.error('Failed to update activity:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function deleteActivity(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  try {
    await prisma.activity.delete({
      where: { id, ownerId: session.user.id },
    });

    revalidatePath('/activities');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete activity:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
