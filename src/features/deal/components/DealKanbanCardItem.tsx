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
import { cn } from '@/features/shared/utils/cn';

interface DealKanbanCardItemProps {
  deal: DealKanbanCard;
  isOverlay?: boolean;
}

export function DealKanbanCardItem({
  deal,
  isOverlay,
}: DealKanbanCardItemProps) {
  return (
    <Card
      className={cn(
        `
          w-full border-border/50 bg-card shadow-sm transition-all select-none
          hover:bg-accent/10
        `,
        isOverlay &&
          `
            scale-[1.02] rotate-1 cursor-grabbing border-primary opacity-80
            shadow-lg
          `
      )}
    >
      <CardHeader className="space-y-1 p-4 pb-1.5">
        <CardTitle
          className="
            text-sm leading-none font-semibold tracking-tight wrap-break-word
            text-foreground
          "
        >
          {deal.title}
        </CardTitle>
        <CardDescription className="truncate text-xs text-muted-foreground">
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
