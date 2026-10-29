'use client';

import { useState } from 'react';

import {
  Clock,
  MoreHorizontalIcon,
  Pencil,
  Trash2Icon,
  TrophyIcon,
  XCircleIcon,
} from 'lucide-react';

import { DeleteDialog } from '@/components/DeleteDialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DealModal } from '@/features/deal/components/DealModal';
import type { DealKanbanCard } from '@/features/deal/deal';
import {
  type DealModalInitialValues,
  getDealInitialValues,
  useDealCardActions,
} from '@/features/deal/deal.utils';
import { PriorityBadge } from '@/features/priority-level/components/PriorityBadge';
import { cn } from '@/features/shared/utils/cn';
import { getCurrencySymbol } from '@/features/shared/utils/currency';
import { DealStatus } from '@/generated/prisma/enums';

interface DealKanbanCardItemProps {
  deal: DealKanbanCard;
  isOverlay?: boolean;
}

export function DealKanbanCardItem({
  deal,
  isOverlay,
}: DealKanbanCardItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { isPending, handleUpdateSubmit, handleDelete, handleStatusChange } =
    useDealCardActions(deal.id, () => setShowDeleteDialog(false));

  const initialFormValues: DealModalInitialValues = getDealInitialValues(deal);

  const isWon = deal.status === DealStatus.WON;
  const isLost = deal.status === DealStatus.LOST;

  return (
    <>
      <Card
        className={cn(
          `
            group relative w-full border-border/50 bg-card shadow-sm
            transition-all select-none
            hover:shadow-md
          `,
          isOverlay &&
            `
              scale-[1.02] rotate-1 cursor-grabbing border-primary opacity-80
              shadow-lg
            `,
          isWon &&
            `
              border-green-500/50 bg-green-50/30
              dark:bg-green-950/10
            `,
          isLost &&
            `
              border-red-500/30 bg-red-50/20
              dark:bg-red-950/10
            `
        )}
      >
        {!isOverlay && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    size-7 text-muted-foreground opacity-0 transition-opacity
                    group-hover:opacity-100
                    hover:bg-accent hover:text-accent-foreground
                  "
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isPending}
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 size-4" />
                  Edit details
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={(e) => handleStatusChange(e, DealStatus.OPEN)}
                  disabled={deal.status === DealStatus.OPEN}
                >
                  <Clock className="mr-2 size-4 text-blue-600" />
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleStatusChange(e, DealStatus.WON)}
                  disabled={isWon}
                >
                  <TrophyIcon className="mr-2 size-4 text-green-600" />
                  Mark as Won
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => handleStatusChange(e, DealStatus.LOST)}
                  disabled={isLost}
                >
                  <XCircleIcon className="mr-2 size-4 text-red-600" />
                  Mark as Lost
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  className="
                    cursor-pointer text-destructive
                    focus:bg-destructive/10 focus:text-destructive
                  "
                >
                  <Trash2Icon className="mr-2 size-4" />
                  Delete Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <CardHeader className="space-y-1 p-4 pr-10 pb-2">
          <CardTitle
            className={cn(
              `
                text-sm leading-none font-semibold tracking-tight
                wrap-break-word text-foreground
              `,
              isLost && 'text-muted-foreground line-through'
            )}
          >
            {deal.title}
          </CardTitle>
          <CardDescription className="truncate text-xs text-muted-foreground">
            {[deal.organization?.name, deal.contactPerson?.name]
              .filter(Boolean)
              .join(' · ')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex items-center justify-between p-4 pt-1">
          <p className="text-sm font-medium tracking-tight text-foreground">
            {`${getCurrencySymbol(deal.currency)}${deal.value}`}
          </p>

          <div className="flex items-center gap-1.5">
            {isWon && (
              <span
                className="
                  inline-flex items-center gap-1 rounded-md bg-green-500/10
                  px-1.5 py-0.5 text-[10px] font-medium text-green-600
                  dark:text-green-400
                "
              >
                <TrophyIcon className="size-3" /> Won
              </span>
            )}
            {isLost && (
              <span
                className="
                  inline-flex items-center gap-1 rounded-md bg-red-500/10 px-1.5
                  py-0.5 text-[10px] font-medium text-red-600
                  dark:text-red-400
                "
              >
                <XCircleIcon className="size-3" /> Lost
              </span>
            )}
            <PriorityBadge priorityLevel={deal.priority} />
          </div>
        </CardContent>
      </Card>

      <DealModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={initialFormValues}
        onSubmitSuccess={handleUpdateSubmit}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Deal"
        itemName={deal.title}
        isPending={isPending}
      />
    </>
  );
}
