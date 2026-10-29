'use client';

import { useTransition } from 'react';

import { toast } from 'sonner';

import type { ActivityTableSelect } from '@/features/activity/activity';
import {
  deleteActivity,
  updateActivity,
} from '@/features/activity/activity.actions';
import type { ActivityFormValues } from '@/features/activity/activity.validation';

export type ActivityModalInitialValues = ActivityFormValues & {
  id?: string;
  dealTitle?: string | null;
  personName?: string | null;
  organizationName?: string | null;
};

export function getActivityInitialValues(
  activity: ActivityTableSelect
): ActivityModalInitialValues {
  return {
    id: activity.id,
    subject: activity.subject,
    type: activity.type,
    startDateTime: new Date(activity.startDate),
    endDateTime: new Date(activity.endDate),
    priority: activity.priority,
    note: '',
    dealId: activity.deal?.id ?? undefined,
    personId: activity.contactPerson?.id ?? undefined,
    organizationId: activity.organization?.id ?? undefined,
    dealTitle: activity.deal?.title ?? null,
    personName: activity.contactPerson?.name ?? null,
    organizationName: activity.organization?.name ?? null,
  };
}

export function useActivityActions(id: string, onDeleteSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateSubmit = async (data: ActivityFormValues) => {
    const result = await updateActivity(id, data);

    if (result.success) {
      toast.success('Activity updated successfully');
    } else {
      toast.error(result.error || 'Failed to update activity');
    }

    return result;
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteActivity(id);

        if (result.success) {
          toast.success('Activity deleted');
          onDeleteSuccess?.();
        } else {
          toast.error(result.error || 'Failed to delete activity');
        }
      } catch {
        toast.error('An unexpected error occurred while deleting');
      }
    });
  };

  const handleToggleDone = (isDone: boolean) => {
    startTransition(async () => {
      const result = await updateActivity(id, { isDone });

      if (!result.success) {
        toast.error(result.error || 'Failed to update status');
      }
    });
  };

  return {
    isPending,
    handleUpdateSubmit,
    handleDelete,
    handleToggleDone,
  };
}
