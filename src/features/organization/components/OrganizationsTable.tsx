'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { Table } from '@/components/table/Table';
import type { OrganizationTableSelect } from '@/features/organization/organization';
import { findNextOccurringDate } from '@/features/shared/utils/date';
import { DealStatus } from '@/generated/prisma/enums';

const columnHelper = createColumnHelper<OrganizationTableSelect>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
  }),
  columnHelper.accessor('_count', {
    header: 'People',
    enableSorting: true,
    cell: (deal) => deal.getValue().people,
  }),
  columnHelper.accessor('deals', {
    id: 'closedDeals',
    header: 'Closed Deals',
    enableSorting: true,
    cell: (deals) =>
      deals
        .getValue()
        .filter(
          (deal) =>
            deal.status === DealStatus.WON || deal.status == DealStatus.LOST
        ).length,
  }),
  columnHelper.accessor('deals', {
    id: 'openDeals',
    header: 'Open Deals',
    enableSorting: true,
    cell: (deals) =>
      deals.getValue().filter((deal) => deal.status === DealStatus.OPEN).length,
  }),
  columnHelper.accessor('activities', {
    header: 'Next activity date',
    enableSorting: true,
    cell: (activities) =>
      findNextOccurringDate(
        activities.getValue(),
        'startDate'
      )?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
  }),
  columnHelper.accessor('owner', {
    header: 'Owner',
    enableSorting: true,
    cell: (owner) => owner.getValue().name,
  }),
];

export function OrganizationsTable({
  organizations,
}: {
  organizations: OrganizationTableSelect[];
}) {
  return (
    <Table<OrganizationTableSelect>
      columns={columns}
      data={organizations}
      className="mt-4"
      defaultSortBy="activities"
      defaultSortDir="asc"
    />
  );
}
