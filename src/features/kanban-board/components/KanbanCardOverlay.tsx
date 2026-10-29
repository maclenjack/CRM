'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DealKanbanCard } from '@/features/deal/deal';
import { PriorityBadge } from '@/features/priority-level/components/PriorityBadge';

export function KanbanCardOverlay({
  deal,
  isOverlay,
}: {
  deal: DealKanbanCard;
  isOverlay?: boolean;
}) {
  return (
    <Card
      className={`
        cursor-grabbing shadow-md select-none
        ${
          isOverlay
            ? `scale-[1.02] border-primary/50 opacity-80 ring-1 ring-primary/10`
            : ''
        }
      `}
    >
      <CardHeader className="space-y-1 p-4 pb-1.5">
        <CardTitle className="text-sm leading-none font-semibold tracking-tight">
          {deal.title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {deal.organization.name} &middot; {deal.contactPerson.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between p-4 pt-0">
        <p className="text-sm font-medium tracking-tight">
          {deal.currency}
          {deal.value.toLocaleString()}
        </p>
        <PriorityBadge priorityLevel={deal.priority} />
      </CardContent>
    </Card>
  );
}
