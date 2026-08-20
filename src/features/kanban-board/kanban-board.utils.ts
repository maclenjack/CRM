import { arrayMove } from '@dnd-kit/sortable';

import type { KanbanCardData } from '@/features/kanban-board/kanban-board.types';

export function getUpdatedColumnCards<T extends KanbanCardData>(
  cards: T[],
  columnCards: T[],
  activeId: string,
  targetColumnId: string,
  activeIndex: number,
  targetIndex: number
): T[] {
  if (activeIndex !== -1) {
    return arrayMove(columnCards, activeIndex, targetIndex);
  }

  const cardToInsert = cards.find((c) => c.id === activeId);
  if (cardToInsert) {
    const updated = [...columnCards];
    updated.splice(targetIndex, 0, {
      ...cardToInsert,
      columnId: targetColumnId,
    });
    return updated;
  }

  return [...columnCards];
}

const MIN_GAP = 0.001;
const DEFAULT_GAP = 1000;

export interface ComputedPositionResult {
  position: number;
  needsReindex: boolean;
}

export function computeCardPosition<T extends KanbanCardData>(
  prevCard: T | undefined,
  nextCard: T | undefined
): ComputedPositionResult {
  if (!prevCard && !nextCard) {
    return { position: DEFAULT_GAP, needsReindex: false };
  }

  if (!prevCard && nextCard) {
    const position = nextCard.position / 2;
    return { position, needsReindex: position < MIN_GAP };
  }

  if (prevCard && !nextCard) {
    return { position: prevCard.position + DEFAULT_GAP, needsReindex: false };
  }

  if (prevCard && nextCard) {
    const gap = nextCard.position - prevCard.position;
    const position = (prevCard.position + nextCard.position) / 2;
    return {
      position,
      needsReindex: Math.abs(gap) < MIN_GAP,
    };
  }

  return { position: DEFAULT_GAP, needsReindex: false };
}
