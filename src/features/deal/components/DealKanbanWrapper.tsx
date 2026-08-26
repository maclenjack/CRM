import { KanbanSquareIcon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ModalButton } from '@/components/ModalButton';
import { Button } from '@/components/ui/button';
import { DealKanbanClient } from '@/features/deal/components/DealKanbanClient';
import { DealModal } from '@/features/deal/components/DealModal';
import {
  type DealKanbanCard,
  dealKanbanCardSelect,
} from '@/features/deal/deal';
import { createDeal, updateDealStage } from '@/features/deal/deal.actions';
import { PipelineStage } from '@/features/deal/pipeline-stage';
import type { MoveCardInput } from '@/features/kanban-board/kanban-board.validation';
import prisma from '@/lib/prisma';

export async function DealKanbanWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const deals: DealKanbanCard[] = (
    await prisma.deal.findMany({
      where: { ownerId: session.user.id },
      orderBy: { position: 'asc' },
      select: dealKanbanCardSelect,
    })
  ).map((deal) => ({
    ...deal,
    value: deal.value ? deal.value.toNumber() : 0,
  }));

  if (deals.length === 0) {
    return (
      <EmptyState
        title="No deals found"
        description="Get started by creating your first sales opportunity to monitor value and status stages."
        icon={KanbanSquareIcon}
        action={
          <ModalButton
            modalComponent={DealModal}
            modalProps={{ onSubmitSuccess: createDeal }}
            asChild
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-medium"
            >
              <PlusIcon className="mr-1.5 size-3.5" />
              Add First Deal
            </Button>
          </ModalButton>
        }
      />
    );
  }

  const columns = PipelineStage.values().map((stage) => ({
    id: stage.value,
    title: stage.label,
  }));

  const formattedCards = deals.map((deal) => ({
    id: deal.id,
    columnId: deal.stage,
    position: deal.position,
    rawDeal: deal,
  }));

  const handleCardMoved = async (payload: MoveCardInput) => {
    'use server';
    return await updateDealStage(payload);
  };

  return (
    <div className="w-full">
      <DealKanbanClient
        columns={columns}
        initialCards={formattedCards}
        onCardMoved={handleCardMoved}
      />
    </div>
  );
}
