'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanCard } from '@/features/kanban-board/components/KanbanCard';
import type {
  KanbanCardData,
  KanbanColumnData,
} from '@/features/kanban-board/kanban-board.types';
import { cn } from '@/features/shared/utils/cn';

interface KanbanColumnProps<T extends KanbanCardData> {
  column: KanbanColumnData;
  cards: T[];
  renderCard: (card: T, isOverlay?: boolean) => React.ReactNode;
}

export function KanbanColumn<T extends KanbanCardData>({
  column,
  cards,
  renderCard,
}: KanbanColumnProps<T>) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id,
    },
  });

  const cardIds = cards.map((c) => c.id);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        `
          flex min-h-[500px] w-80 shrink-0 flex-col rounded-xl border
          border-border bg-muted/40 p-2 shadow-none transition-colors
          duration-200
        `,
        isOver && 'border-primary/20 bg-muted ring-1 ring-primary/10'
      )}
    >
      <CardHeader
        className="
          flex flex-row items-center justify-between space-y-0 p-3 pb-2
        "
      >
        <div className="flex items-center gap-2">
          <CardTitle
            className="
              text-xs font-semibold tracking-wider text-muted-foreground
              uppercase
            "
          >
            {column.title}
          </CardTitle>
          <span
            className="
              flex h-5 min-w-5 items-center justify-center rounded-full
              bg-muted-foreground/15 px-1 text-[10px] font-medium
              text-muted-foreground
            "
          >
            {cards.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-2 pt-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} renderCard={renderCard} />
          ))}

          {cards.length === 0 && (
            <div
              className="
                flex min-h-[120px] flex-1 items-center justify-center rounded-lg
                border border-dashed border-muted-foreground/20 p-8 text-center
                text-xs text-muted-foreground/60
              "
            >
              Drop cards here
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
