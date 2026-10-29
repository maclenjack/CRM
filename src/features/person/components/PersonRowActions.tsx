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
import { PersonModal } from '@/features/person/components/PersonModal';
import type { PersonTableSelect } from '@/features/person/person';
import { usePersonActions } from '@/features/person/person.hooks';
import { getPersonInitialValues } from '@/features/person/person.utils';

interface PersonRowActionsProps {
  person: PersonTableSelect;
}

export function PersonRowActions({ person }: PersonRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { isPending, handleUpdateSubmit, handleDelete } = usePersonActions(
    person.id,
    () => setShowDeleteDialog(false)
  );

  const initialFormValues = getPersonInitialValues(person);

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
          >
            <span className="sr-only">Open menu</span>
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

      <PersonModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={initialFormValues}
        onSubmitSuccess={handleUpdateSubmit}
      />

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Person"
        itemName={person.name}
        isPending={isPending}
      />
    </>
  );
}
