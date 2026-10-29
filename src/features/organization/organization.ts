import type { DealStatus } from '@/generated/prisma/enums';
import type {
  OrganizationGetPayload,
  OrganizationModel,
} from '@/generated/prisma/models';

export interface OrganizationsTableData {
  name: string;
  _count: { people: number };
  deals: { status: DealStatus }[];
  activities: { startDate: Date; endDate: Date }[];
  owner: { name: string | null };
}

export const organizationsTableSelect = {
  id: true,
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

export function mapOrganizationToOption(
  organization: Pick<OrganizationModel, 'id' | 'name'>
) {
  return {
    value: organization.id,
    label: organization.name,
  };
}
