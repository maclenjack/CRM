'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { KanbanCardData } from '@/features/kanban-board/kanban-board.types';
import { cn } from '@/features/shared/utils/cn';

interface KanbanCardProps<T extends KanbanCardData> {
  card: T;
  renderCard: (card: T, isOverlay?: boolean) => React.ReactNode;
}

export function KanbanCard<T extends KanbanCardData>({
  card,
  renderCard,
}: KanbanCardProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        `
          cursor-grab rounded-xl transition-opacity duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2
          active:cursor-grabbing
        `,
        isDragging &&
          `
            pointer-events-none border-2 border-dashed border-primary/20
            opacity-30 shadow-none
          `
      )}
    >
      {renderCard(card, false)}
    </div>
  );
}
