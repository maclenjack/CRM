'use server';

import { revalidatePath } from 'next/cache';

import z from 'zod';

import { auth } from '@/auth';
import { DealFormSchema } from '@/features/deal/deal.validation';
import { PipelineStage } from '@/features/deal/pipeline-stage';
import { MoveCardSchema } from '@/features/kanban-board/kanban-board.validation';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import type { DealModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

export async function createDeal(rawInput: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  const parseResult = DealFormSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: 'Validation failed',
      validationErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const validatedData = parseResult.data;

  try {
    await prisma.deal.create({
      data: {
        title: validatedData.title,
        personId: validatedData.personId,
        organizationId: validatedData.organizationId,
        value: validatedData.value,
        currency: validatedData.currency,
        stage: validatedData.stage,
        status: validatedData.status,
        priority: validatedData.priority,
        expectedCloseDate: validatedData.expectedCloseDate,
        ownerId: session.user.id,
        createdById: session.user.id,
        updatedById: session.user.id,
        notes: validatedData.note
          ? {
              create: {
                content: validatedData.note,
                createdById: session.user.id,
                updatedById: session.user.id,
              },
            }
          : undefined,
      },
    });

    revalidatePath('/deals');

    return { success: true };
  } catch (error) {
    console.error('Failed to create deal:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function updateDealStageAction(rawInput: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in.' };
  }

  const validation = MoveCardSchema.safeParse(rawInput);

  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid request payload',
      details: z.treeifyError(validation.error),
    };
  }

  const { cardId, targetColumnId, targetPosition } = validation.data;

  if (!PipelineStage.isEnum(targetColumnId)) {
    return { success: false, error: 'Invalid stage column destination' };
  }

  try {
    await prisma.deal.update({
      where: { id: cardId, ownerId: session.user.id },
      data: {
        stage: PipelineStage.fromValue(targetColumnId).value,
        position: targetPosition,
      },
    });

    revalidatePath('/deals');

    return { success: true };
  } catch (error) {
    console.error('Failed to update stage:', error);
    return {
      success: false,
      error:
        error instanceof z.ZodError ? 'Invalid Input' : 'Internal Server Error',
    };
  }
}

export const searchDeals = createSearchAction<DealModel>(prisma.deal, {
  searchField: 'title',
  selectFields: { id: true, title: true } as any,
  limit: 15,
});
