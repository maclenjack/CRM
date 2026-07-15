import { KanbanSquareIcon, PlusIcon } from 'lucide-react';

import { auth } from '@/auth';
import { EmptyState } from '@/components/EmptyState';
import { ModalButton } from '@/components/ModalButton';
import { Button } from '@/components/ui/button';
import { AddDealModal } from '@/features/deal/components/AddDealModal';
import { DealKanbanClient } from '@/features/deal/components/DealKanbanClient';
import {
  type DealKanbanCard,
  dealKanbanCardSelect,
} from '@/features/deal/deal';
import {
  createDeal,
  updateDealStageAction,
} from '@/features/deal/deal.actions';
import { PipelineStage } from '@/features/deal/pipeline-stage';
import type { MoveCardInput } from '@/features/kanban-board/kanban-board.validation';
import prisma from '@/lib/prisma';

export async function DealKanbanBoardWrapper() {
  const session = await auth();
  if (!session?.user) return null;

  const deals: DealKanbanCard[] = await prisma.deal.findMany({
    where: { ownerId: session.user.id },
    orderBy: { position: 'asc' },
    select: dealKanbanCardSelect,
  });

  if (deals.length === 0) {
    return (
      <EmptyState
        title="No deals found"
        description="Get started by creating your first sales opportunity to monitor value and status stages."
        icon={KanbanSquareIcon}
        action={
          <ModalButton
            modalComponent={AddDealModal}
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
    return await updateDealStageAction(payload);
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
