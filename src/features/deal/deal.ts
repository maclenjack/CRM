import type { ComboboxOption } from '@/components/form/AsyncCombobox';
import type {
  DealGetPayload,
  DealModel,
  DealSelect,
} from '@/generated/prisma/models';

export const dealKanbanCardSelect = {
  id: true,
  title: true,
  value: true,
  currency: true,
  stage: true,
  status: true,
  priority: true,
  position: true,
  expectedCloseDate: true,
  contactPerson: {
    select: {
      id: true,
      name: true,
    },
  },
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
} as const satisfies DealSelect;

type RawDealKanbanCard = DealGetPayload<{
  select: typeof dealKanbanCardSelect;
}>;

export type DealKanbanCard = Omit<RawDealKanbanCard, 'value'> & {
  value: number;
};

export function mapDealToOption(
  deal: Pick<DealModel, 'id' | 'title'>
): ComboboxOption {
  return {
    value: deal.id,
    label: deal.title,
  };
}
