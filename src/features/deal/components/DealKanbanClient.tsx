'use client';

import { useEffect, useState } from 'react';

import { DealKanbanCardItem } from '@/features/deal/components/DealKanbanCardItem';
import type { DealKanbanCard } from '@/features/deal/deal';
import { KanbanBoard } from '@/features/kanban-board/components/KanbanBoard';
import { KanbanLoadingPlaceholder } from '@/features/kanban-board/components/KanbanLoadingPlaceholder';
import type { KanbanColumnData } from '@/features/kanban-board/kanban-board.types';
import type { MoveCardInput } from '@/features/kanban-board/kanban-board.validation';

type EnrichedKanbanCard = {
  id: string;
  columnId: string;
  position: number;
  rawDeal: DealKanbanCard;
};

interface DealKanbanClientProps {
  columns: KanbanColumnData[];
  initialCards: EnrichedKanbanCard[];
  onCardMoved: (
    payload: MoveCardInput
  ) => Promise<{ success: boolean; error?: string }>;
}

export function DealKanbanClient({
  columns,
  initialCards,
  onCardMoved,
}: DealKanbanClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <KanbanLoadingPlaceholder />;
  }
  return (
    <KanbanBoard<EnrichedKanbanCard>
      initialColumns={columns}
      initialCards={initialCards}
      onCardMoved={onCardMoved}
      renderCard={(card, isOverlay) => (
        <DealKanbanCardItem deal={card.rawDeal} isOverlay={isOverlay} />
      )}
    />
  );
}
