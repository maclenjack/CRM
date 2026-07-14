'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { CalendarIcon, UserIcon } from 'lucide-react';

import { Table } from '@/components/table/Table';
import type { OrganizationTableSelect } from '@/features/organization/organization';
import { findNextOccurringDate } from '@/features/shared/utils/date';
import { DealStatus } from '@/generated/prisma/enums';

const columnHelper = createColumnHelper<OrganizationTableSelect>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Organization Name',
    enableSorting: true,
    cell: (info) => (
      <span className="block py-1 font-semibold tracking-tight text-foreground">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('_count', {
    header: 'People',
    enableSorting: true,
    meta: { align: 'center' },
    cell: (info) => (
      <span
        className="
          inline-flex items-center gap-1 rounded-md border border-border
          bg-muted px-2 py-0.5 font-mono text-xs font-medium
          text-muted-foreground
        "
      >
        <UserIcon className="size-3 stroke-[2.5]" />
        {info.getValue().people}
      </span>
    ),
  }),
  columnHelper.accessor('deals', {
    id: 'closedDeals',
    header: 'Closed Deals',
    enableSorting: true,
    meta: { align: 'center' },
    cell: (info) => {
      const count = info
        .getValue()
        .filter(
          (deal) =>
            deal.status === DealStatus.WON || deal.status === DealStatus.LOST
        ).length;
      return (
        <span className="font-mono text-sm text-foreground/80">{count}</span>
      );
    },
  }),
  columnHelper.accessor('deals', {
    id: 'openDeals',
    header: 'Open Deals',
    enableSorting: true,
    meta: { align: 'center' },
    cell: (info) => {
      const count = info
        .getValue()
        .filter((deal) => deal.status === DealStatus.OPEN).length;
      return (
        <span
          className={`
            font-mono text-sm font-semibold
            ${count > 0 ? 'text-secondary' : 'text-muted-foreground/60'}
          `}
        >
          {count}
        </span>
      );
    },
  }),
  columnHelper.accessor('activities', {
    header: 'Next Activity',
    enableSorting: true,
    meta: { align: 'center' },
    cell: (info) => {
      const date = findNextOccurringDate(info.getValue(), 'startDate');
      if (!date)
        return (
          <span className="font-mono text-xs text-muted-foreground/40">—</span>
        );

      return (
        <span
          className="
            inline-flex items-center gap-2 text-sm font-medium text-foreground
          "
        >
          <CalendarIcon className="size-3.5 text-muted-foreground" />
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    },
  }),
  columnHelper.accessor('owner', {
    header: 'Account Owner',
    enableSorting: true,
    cell: (info) => (
      <span className="text-sm font-medium text-muted-foreground">
        {info.getValue().name}
      </span>
    ),
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
