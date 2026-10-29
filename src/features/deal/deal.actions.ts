'use server';

import { revalidatePath } from 'next/cache';

import {
  CreateDealSchema,
  DeleteDealSchema,
  UpdateDealSchema,
  UpdateDealStatusSchema,
} from '@/features/deal/deal.validation';
import { PipelineStage } from '@/features/deal/pipeline-stage';
import { MoveCardSchema } from '@/features/kanban-board/kanban-board.validation';
import { actionPipeline } from '@/features/shared/actions/action-pipeline';
import { createSearchAction } from '@/features/shared/actions/search-factory';
import { Prisma } from '@/generated/prisma/client';
import type { DealModel } from '@/generated/prisma/models';
import prisma from '@/lib/prisma';

const DEALS_PATH = '/deals';

export async function createDeal(rawInput: unknown) {
  return actionPipeline({
    schema: CreateDealSchema,
    rawInput,
    actionName: 'CreateDeal',
    handler: async (data, userId) => {
      const { note, value, ...scalarFields } = data;

      const deal = await prisma.deal.create({
        data: {
          ...scalarFields,
          value: new Prisma.Decimal(value),
          ownerId: userId,
          createdById: userId,
          notes: note
            ? { create: { content: note, createdById: userId } }
            : undefined,
        },
        select: { id: true },
      });

      revalidatePath(DEALS_PATH);
      return { id: deal.id };
    },
  });
}

export async function updateDeal(dealId: string, rawInput: unknown) {
  return actionPipeline({
    schema: UpdateDealSchema,
    rawInput,
    actionName: 'UpdateDeal',
    handler: async (data, userId) => {
      const { note, value, ...scalarFields } = data;

      const deal = await prisma.deal.update({
        where: { id: dealId, ownerId: userId },
        data: {
          ...scalarFields,
          value: new Prisma.Decimal(value),
          notes: note
            ? { create: { content: note, createdById: userId } }
            : undefined,
        },
        select: { id: true },
      });

      revalidatePath(DEALS_PATH);
      return { id: deal.id };
    },
  });
}

export async function updateDealStage(rawInput: unknown) {
  return actionPipeline({
    schema: MoveCardSchema,
    rawInput,
    actionName: 'UpdateDealStage',
    handler: async (data, userId) => {
      const targetStage = PipelineStage.fromValue(data.targetColumnId).value;

      const deal = await prisma.deal.update({
        where: { id: data.cardId, ownerId: userId },
        data: {
          stage: targetStage,
          position: data.position,
        },
        select: { id: true },
      });

      if (data.needsReindex) {
        const stageDeals = await prisma.deal.findMany({
          where: {
            stage: targetStage,
            ownerId: userId,
          },
          orderBy: { position: 'asc' },
          select: { id: true },
        });

        await prisma.$transaction(
          stageDeals.map((item, index) =>
            prisma.deal.update({
              where: { id: item.id },
              data: { position: (index + 1) * 1000 },
            })
          )
        );
      }

      revalidatePath(DEALS_PATH);
      return { id: deal.id };
    },
  });
}

export async function updateDealStatus(rawInput: unknown) {
  return actionPipeline({
    schema: UpdateDealStatusSchema,
    rawInput,
    actionName: 'UpdateDealStatus',
    handler: async (data, userId) => {
      const deal = await prisma.deal.update({
        where: { id: data.id, ownerId: userId },
        data: { status: data.status },
        select: { id: true },
      });

      revalidatePath(DEALS_PATH);
      return { id: deal.id };
    },
  });
}

export async function deleteDeal(rawInput: unknown) {
  return actionPipeline({
    schema: DeleteDealSchema,
    rawInput,
    actionName: 'DeleteDeal',
    handler: async (data, userId) => {
      const deal = await prisma.deal.delete({
        where: { id: data.id, ownerId: userId },
        select: { id: true },
      });

      revalidatePath(DEALS_PATH);
      return { id: deal.id };
    },
  });
}

export const searchDeals = createSearchAction<DealModel, typeof prisma.deal>(
  prisma.deal,
  {
    searchField: 'title',
    selectFields: { id: true, title: true } as any,
    limit: 15,
  }
);
