'use client';

import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { KanbanColumn } from '@/features/kanban-board/components/KanbanColumn';
import type {
  KanbanCardData,
  KanbanColumnData,
} from '@/features/kanban-board/kanban-board.types';
import {
  computeCardPosition,
  getUpdatedColumnCards,
} from '@/features/kanban-board/kanban-board.utils';
import {
  type MoveCardInput,
  MoveCardSchema,
} from '@/features/kanban-board/kanban-board.validation';

interface KanbanBoardProps<T extends KanbanCardData> {
  initialColumns: KanbanColumnData[];
  initialCards: T[];
  onCardMoved: (
    payload: MoveCardInput
  ) => Promise<{ success: boolean; error?: string }>;
  renderCard: (card: T, isOverlay?: boolean) => React.ReactNode;
}

export function KanbanBoard<T extends KanbanCardData>({
  initialColumns,
  initialCards,
  onCardMoved,
  renderCard,
}: KanbanBoardProps<T>) {
  const [prevInitialCards, setPrevInitialCards] = useState<T[]>(initialCards);
  const [cards, setCards] = useState<T[]>(initialCards);

  const initialCardsKey = JSON.stringify(initialCards);
  const prevInitialCardsKey = JSON.stringify(prevInitialCards);

  if (initialCardsKey !== prevInitialCardsKey) {
    setCards(initialCards);
    setPrevInitialCards(initialCards);
  }

  const [prevInitialColumns, setPrevInitialColumns] =
    useState<KanbanColumnData[]>(initialColumns);
  const [columns, setColumns] = useState<KanbanColumnData[]>(initialColumns);

  if (initialColumns !== prevInitialColumns) {
    setColumns(initialColumns);
    setPrevInitialColumns(initialColumns);
  }

  const [activeCard, setActiveCard] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, T[]>();
    columns.forEach((col) => map.set(col.id, []));

    const sortedCards = [...cards].sort((a, b) => a.position - b.position);
    sortedCards.forEach((card) => {
      const list = map.get(card.columnId) || [];
      list.push(card);
      map.set(card.columnId, list);
    });
    return map;
  }, [cards, columns]);

  const cardSnapshotsRef = useRef<
    Map<string, { columnId: string; position: number }>
  >(new Map());

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as T | undefined;
    if (!card) return;

    cardSnapshotsRef.current.set(card.id, {
      columnId: card.columnId,
      position: card.position,
    });

    setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isOverACard = over.data.current?.type === 'Card';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isOverACard && !isOverAColumn) return;

    const activeCardData = active.data.current?.card as T;
    const targetColumnId = isOverACard
      ? (over.data.current?.card as T).columnId
      : overId;

    if (!activeCardData || !targetColumnId) return;

    if (activeCardData.columnId !== targetColumnId) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === activeId ? { ...card, columnId: targetColumnId } : card
        )
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id.toString();
    const initialCardState = cardSnapshotsRef.current.get(activeId);
    const overId = over.id.toString();
    const isOverACard = over.data.current?.type === 'Card';

    const targetColumnId = isOverACard
      ? (over.data.current?.card as T).columnId
      : overId;

    const columnCards = [...cards]
      .filter((c) => c.columnId === targetColumnId)
      .sort((a, b) => a.position - b.position);

    const activeIndex = columnCards.findIndex((c) => c.id === activeId);

    const rawTargetIndex = isOverACard
      ? columnCards.findIndex((c) => c.id === overId)
      : columnCards.length;

    const targetIndex =
      rawTargetIndex === -1 ? columnCards.length : rawTargetIndex;

    const updatedColumnCards = getUpdatedColumnCards(
      cards,
      columnCards,
      activeId,
      targetColumnId,
      activeIndex,
      targetIndex
    );

    const finalActiveIndex = updatedColumnCards.findIndex(
      (c) => c.id === activeId
    );
    if (finalActiveIndex === -1) return;

    const computedPosition = computeCardPosition(
      updatedColumnCards[finalActiveIndex - 1],
      updatedColumnCards[finalActiveIndex + 1]
    );

    const validation = MoveCardSchema.safeParse({
      cardId: activeId,
      targetColumnId,
      ...computedPosition,
    });

    if (!validation.success) {
      toast.error('Invalid drag action. Action aborted.');
      return;
    }

    const validatedPayload = validation.data;

    setCards((prev) =>
      prev.map((card) =>
        card.id === validatedPayload.cardId
          ? {
              ...card,
              columnId: validatedPayload.targetColumnId,
              position: validatedPayload.position,
            }
          : card
      )
    );

    try {
      const response = await onCardMoved(validatedPayload);
      if (!response.success) throw new Error(response.error || 'Server error');
      toast.success('Board updated');
      cardSnapshotsRef.current.delete(activeId);
    } catch (err) {
      console.error(err);
      toast.error('Could not save card position. Rolling back changes.');

      if (initialCardState) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  columnId: initialCardState.columnId,
                  position: initialCardState.position,
                }
              : c
          )
        );
      }
      cardSnapshotsRef.current.delete(activeId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="
          flex max-w-full scrollbar-thin items-start gap-6 overflow-x-auto pb-6
          select-none
        "
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cardsByColumn.get(column.id) || []}
            renderCard={renderCard}
          />
        ))}
      </div>

      {typeof window !== 'undefined' &&
        createPortal(
          <DragOverlay adjustScale={false}>
            {activeCard ? renderCard(activeCard, true) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
