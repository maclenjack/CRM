import { useTransition } from 'react';

import { toast } from 'sonner';

import type { DealKanbanCard } from '@/features/deal/deal';
import {
  deleteDeal,
  updateDeal,
  updateDealStatus,
} from '@/features/deal/deal.actions';
import type {
  CreateDealValues,
  UpdateDealValues,
} from '@/features/deal/deal.validation';
import {
  DealStatus,
  PipelineStage,
  PriorityLevel,
} from '@/generated/prisma/enums';

export type DealModalInitialValues = UpdateDealValues & {
  id?: string;
  personName?: string | null;
  organizationName?: string | null;
};

export function getDealInitialValues(
  deal: DealKanbanCard
): DealModalInitialValues {
  return {
    id: deal.id,
    title: deal.title,
    value: String(deal.value),
    currency: deal.currency,
    personId: deal.contactPerson?.id,
    personName: deal.contactPerson?.name ?? null,
    organizationId: deal.organization?.id,
    organizationName: deal.organization?.name ?? null,
    stage: deal.stage as PipelineStage,
    status: deal.status as DealStatus,
    priority: deal.priority as PriorityLevel,
    expectedCloseDate: deal.expectedCloseDate
      ? new Date(deal.expectedCloseDate)
      : new Date(),
  };
}

export function useDealCardActions(id: string, onDeleteSuccess?: () => void) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateSubmit = (data: CreateDealValues | UpdateDealValues) => {
    // eslint-disable-next-line compat/compat
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      startTransition(async () => {
        const result = await updateDeal(id, data as UpdateDealValues);

        if (result.success) {
          toast.success('Deal updated successfully');
        } else {
          console.warn('[useDealCardActions] Update failed:', result.error);
          toast.error(result.error || 'Failed to update deal');
        }

        resolve(result);
      });
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDeal({ id });

      if (result.success) {
        toast.success('Deal deleted');
        onDeleteSuccess?.();
      } else {
        console.warn('[useDealCardActions] Delete failed:', result.error);
        toast.error(result.error || 'Failed to delete deal');
      }
    });
  };

  const handleStatusChange = (e: React.MouseEvent, status: DealStatus) => {
    e.stopPropagation();

    startTransition(async () => {
      const result = await updateDealStatus({ id, status });

      if (result.success) {
        toast.success(`Deal marked as ${status.toLowerCase()}`);
      } else {
        console.warn(
          '[useDealCardActions] Status update failed:',
          result.error
        );
        toast.error(result.error || 'Failed to update deal status');
      }
    });
  };

  return {
    isPending,
    handleUpdateSubmit,
    handleDelete,
    handleStatusChange,
  };
}
