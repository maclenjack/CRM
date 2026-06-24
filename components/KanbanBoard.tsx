'use client';

import { useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { DealCard } from '@/components/DealCard';
import { DealCardOverlay } from '@/components/DealCardOverlay';
import { KanbanBoardStage } from '@/components/KanbanBoardStage';
import {
  Deal,
  DealsByStageMap,
  PipelineStage,
  isValidPipelineStage,
} from '@/types';

interface KanbanBoardProps {
  dealsByStage: DealsByStageMap;
}

type DroppableId = PipelineStage | string; // Could be a stage ID or a card ID depending on context

export function KanbanBoard({ dealsByStage }: KanbanBoardProps) {
  const [boardData, setBoardData] = useState<DealsByStageMap>(dealsByStage);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const getBoardData = (id: DroppableId): Deal[] => {
    if (isValidPipelineStage(id)) {
      return boardData.get(id) || [];
    }
    return [];
  };

  // Find which stage a card currently belongs to
  const findStageOfCard = (cardId: string): PipelineStage => {
    return boardData
      .keys()
      .find((stageId) =>
        getBoardData(stageId as PipelineStage).some(
          (card) => card.id === cardId
        )
      ) as PipelineStage;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const stageId: PipelineStage = findStageOfCard(active.id.toString());
    const deal = boardData.get(stageId)?.find((c: Deal) => c.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  // Triggers smoothly when moving between cards or columns
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId: DroppableId = active.id.toString();
    const overId: DroppableId = isValidPipelineStage(over.id.toString())
      ? (over.id.toString() as PipelineStage)
      : over.id.toString();

    const activeStage: PipelineStage = findStageOfCard(activeId);
    // The target could be a Column ID OR another Card ID
    const overStage: PipelineStage = isValidPipelineStage(overId)
      ? overId
      : findStageOfCard(overId);

    if (!activeStage || !overStage || activeStage === overStage) return;

    setBoardData((prev: DealsByStageMap) => {
      const activeItems = prev.get(activeStage) || [];
      const overItems = prev.get(overStage as PipelineStage) || [];
      const activeIndex = activeItems?.findIndex((i) => i.id === activeId);

      // If over a card, insert at its index. If over an empty column, push to end.
      // const isOverACard = !prev.get(overId as PipelineStage)?.length;
      // const overIndex = isOverACard
      //   ? overItems.findIndex((i) => i.id === overId)
      //   : overItems.length;

      const updatedActive = activeItems.filter((i) => i.id !== activeId);
      const movedItem = { ...activeItems[activeIndex], stageId: overStage };
      const updatedOver = [...overItems, movedItem];
      // updatedOver.splice(overIndex, 0, movedItem);

      return new Map(prev)
        .set(activeStage, updatedActive)
        .set(overStage, updatedOver);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    const stageId = findStageOfCard(activeId);

    if (!stageId) return;

    // Handle reordering items within the exact same stage column
    if (activeId !== overId) {
      const items = boardData.get(stageId) || [];
      const oldIndex = items.findIndex((i) => i.id === activeId);
      const newIndex =
        items.findIndex((i) => i.id === overId) || items.length - 1;

      setBoardData((prev) => {
        return new Map(prev).set(
          stageId,
          arrayMove(items, oldIndex, newIndex) || []
        );
      });
    }
  };

  return (
    <DndContext
      id="kanban-board"
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4 select-none">
        {Array.from(boardData).map(([stageId, deals]) => {
          const dealIds = deals.map((deal: Deal) => deal.id) || [];
          return (
            <KanbanBoardStage
              key={stageId}
              id={stageId}
              title={stageId.toUpperCase()}
            >
              <SortableContext
                items={dealIds}
                strategy={verticalListSortingStrategy}
              >
                {deals.map((deal: Deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </SortableContext>
            </KanbanBoardStage>
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCardOverlay deal={activeDeal} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
