'use client';

import { useTransition } from 'react';

import { toast } from 'sonner';

import type { PersonTableSelect } from '@/features/person/person';
import { deletePerson, updatePerson } from '@/features/person/person.actions';
import type { PersonFormValues } from '@/features/person/person.validation';
import { ContactCategory as PrismaContactCategory } from '@/generated/prisma/enums';

export type PersonModalInitialValues = PersonFormValues & {
  id?: string;
  organizationName?: string | null;
};

export function getPersonInitialValues(
  person: PersonTableSelect
): PersonModalInitialValues {
  return {
    id: person.id,
    name: person.name,
    organizationId: person.organization?.id ?? '',
    organizationName: person.organization?.name ?? null,
    phones: person.phones.map((p) => ({
      value: p.phone,
      type: p.category as PrismaContactCategory,
      countryCode: 'US',
    })),
    emails: person.emails.map((e) => ({
      value: e.email,
      type: e.category as PrismaContactCategory,
    })),
  };
}

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
