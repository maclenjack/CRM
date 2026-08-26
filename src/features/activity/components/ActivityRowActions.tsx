'use client';

import { useState } from 'react';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { DeleteDialog } from '@/components/DeleteDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ActivityTableSelect } from '@/features/activity/activity';
import {
  getActivityInitialValues,
  useActivityActions,
} from '@/features/activity/activity.utils';
import { ActivityModal } from '@/features/activity/components/ActivityModal';

interface ActivityRowActionsProps {
  activity: ActivityTableSelect;
}

export function ActivityRowActions({ activity }: ActivityRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { isPending, handleUpdateSubmit, handleDelete } = useActivityActions(
    activity.id,
    () => setShowDeleteDialog(false)
  );

  const initialFormValues = getActivityInitialValues(activity);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="
              size-8 p-0 text-muted-foreground
              hover:text-foreground
            "
            aria-label="Open activity actions menu"
          >
            <MoreHorizontal className="size-4" />
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
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="
              cursor-pointer text-destructive
              focus:text-destructive
            "
          >
            <Trash2 className="mr-2 size-4" />
            Delete row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ActivityModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={initialFormValues}
        onSubmitSuccess={handleUpdateSubmit}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Activity"
        itemName={activity.subject}
        isPending={isPending}
      />
    </>
  );
}
