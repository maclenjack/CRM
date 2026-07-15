'use server';

import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';
import type { ActivityFormValues } from '@/features/activity/activity.validation';
import prisma from '@/lib/prisma';

export async function createActivity(formData: ActivityFormValues) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  try {
    await prisma.activity.create({
      data: {
        subject: formData.subject,
        type: formData.type,
        priority: formData.priority,
        startDate: formData.startDateTime,
        endDate: formData.endDateTime,
        dealId: formData.dealId,
        personId: formData.personId,
        organizationId: formData.organizationId,
        ownerId: session.user.id,
        createdById: session.user.id,
        updatedById: session.user.id,
        notes: formData.note
          ? {
              create: {
                content: formData.note,
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
