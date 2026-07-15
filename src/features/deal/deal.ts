import type { DealGetPayload, DealSelect } from '@/generated/prisma/models';

export const dealKanbanCardSelect = {
  id: true,
  title: true,
  value: true,
  currency: true,
  stage: true,
  status: true,
  priority: true,
  position: true,
  contactPerson: {
    select: {
      name: true,
    },
  },
  organization: {
    select: {
      name: true,
    },
  },
} satisfies DealSelect;

export type DealKanbanCard = DealGetPayload<{
  select: typeof dealKanbanCardSelect;
}>;
