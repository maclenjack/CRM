import type { DealStatus } from '@/generated/prisma/enums';
import type { OrganizationGetPayload } from '@/generated/prisma/models';

export interface OrganizationsTableData {
  name: string;
  _count: { people: number };
  deals: { status: DealStatus }[];
  activities: { startDate: Date; endDate: Date }[];
  owner: { name: string | null };
}

export const organizationsTableSelect = {
  name: true,
  _count: {
    select: {
      people: true,
    },
  },
  deals: {
    select: {
      status: true,
    },
  },
  activities: {
    select: {
      startDate: true,
      endDate: true,
    },
  },
  owner: {
    select: {
      name: true,
    },
  },
};

export type OrganizationTableSelect = OrganizationGetPayload<{
  select: typeof organizationsTableSelect;
}>;
