'use client';

import { useTransition } from 'react';

import { toast } from 'sonner';

import type { OrganizationTableSelect } from '@/features/organization/organization';
import {
  deleteOrganization,
  updateOrganization,
} from '@/features/organization/organization.actions';
import type { OrganizationFormValues } from '@/features/organization/organization.validation';

export type OrganizationModalInitialValues = OrganizationFormValues & {
  id?: string;
};

export function getOrganizationInitialValues(
  organization: OrganizationTableSelect
): OrganizationModalInitialValues {
  return {
    id: organization.id,
    name: organization.name,
  };
}

export function useOrganizationActions(
  id: string,
  onDeleteSuccess?: () => void
) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateSubmit = async (data: OrganizationFormValues) => {
    const result = await updateOrganization(id, data);

    if (result.success) {
      toast.success('Organization updated successfully');
    } else {
      toast.error(result.error || 'Failed to update organization');
    }

    return result;
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteOrganization(id);

        if (result.success) {
          toast.success('Organization deleted');
          onDeleteSuccess?.();
        } else {
          toast.error(result.error || 'Failed to delete organization');
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
