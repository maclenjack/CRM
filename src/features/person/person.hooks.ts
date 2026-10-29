import { useTransition } from 'react';

import { toast } from 'sonner';

import { deletePerson, updatePerson } from '@/features/person/person.actions';
import type { PersonFormValues } from '@/features/person/person.validation';

export function usePersonActions(id: string, onDeleteSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateSubmit = async (data: PersonFormValues) => {
    const result = await updatePerson(id, data);

    if (result.success) {
      toast.success('Person updated successfully');
    } else {
      toast.error(result.error || 'Failed to update person');
    }

    return result;
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePerson(id);

        if (result.success) {
          toast.success('Person deleted');
          onDeleteSuccess?.();
        } else {
          toast.error(result.error || 'Failed to delete person');
        }
      } catch {
        toast.error('An unexpected error occurred while deleting');
      }
    });
  };

  return {
    isPending,
    handleUpdateSubmit,
    handleDelete,
  };
}
