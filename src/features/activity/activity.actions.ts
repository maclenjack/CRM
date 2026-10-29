'use server';

import { revalidatePath } from 'next/cache';

import {
  ActivityFormSchema,
  DeleteActivitySchema,
  UpdateActivitySchema,
} from '@/features/activity/activity.validation';
import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import prisma from '@/lib/prisma';

export async function createActivity(rawInput: unknown) {
  return actionPipeline({
    schema: ActivityFormSchema,
    rawInput,
    actionName: 'createActivity',
    handler: async (data, userId) => {
      const created = await prisma.activity.create({
        data: {
          subject: data.subject,
          type: data.type,
          priority: data.priority,
          startDate: data.startDateTime,
          endDate: data.endDateTime,
          dealId: data.dealId,
          personId: data.personId,
          organizationId: data.organizationId,
          ownerId: userId,
          createdById: userId,
          updatedById: userId,
          notes: data.note
            ? {
                create: {
                  content: data.note,
                  createdById: userId,
                  updatedById: userId,
                },
              }
            : undefined,
        },
      });

      revalidatePath('/activities');

      return { id: created.id };
    },
  });
}

export async function updateActivity(id: string, payload: unknown) {
  return actionPipeline({
    schema: UpdateActivitySchema,
    rawInput:
      typeof payload === 'object' && payload !== null
        ? { ...payload, id }
        : { id },
    actionName: 'updateActivity',
    handler: async (validatedInput, userId) => {
      const {
        id: activityId,
        startDateTime,
        endDateTime,
        note,
        startDate,
        endDate,
        ...rest
      } = validatedInput;

      const finalStartDate = startDateTime ?? startDate;
      const finalEndDate = endDateTime ?? endDate;

      const updated = await prisma.activity.update({
        where: {
          id: activityId,
          ownerId: userId,
        },
        data: {
          ...rest,
          ...(finalStartDate && { startDate: finalStartDate }),
          ...(finalEndDate && { endDate: finalEndDate }),
          updatedById: userId,
          ...(note !== undefined &&
            note !== '' && {
              notes: {
                create: {
                  content: note,
                  createdById: userId,
                  updatedById: userId,
                },
              },
            }),
        },
      });

      revalidatePath('/activities');

      return { id: updated.id };
    },
  });
}

export async function deleteActivity(id: string) {
  return actionPipeline({
    schema: DeleteActivitySchema,
    rawInput: { id },
    actionName: 'deleteActivity',
    handler: async ({ id: activityId }, userId) => {
      const deleted = await prisma.activity.update({
        where: {
          id: activityId,
          ownerId: userId,
        },
        data: {
          deletedAt: new Date(),
          updatedById: userId,
        },
      });

      revalidatePath('/activities');

      return { id: deleted.id };
    },
  });
}
