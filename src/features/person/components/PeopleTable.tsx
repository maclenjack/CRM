'use client';

import { createColumnHelper } from '@tanstack/react-table';

import { Table } from '@/components/table/Table';
import { EmailList } from '@/features/person/components/EmailList';
import { PhoneList } from '@/features/person/components/PhoneList';
import type { PersonTableSelect } from '@/features/person/person';

const columnHelper = createColumnHelper<PersonTableSelect>();
const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
  }),
  columnHelper.accessor('organization.name', {
    header: 'Organization',
    enableSorting: true,
  }),
  columnHelper.accessor('emails', {
    header: 'Email',
    cell: (emails) => <EmailList emails={emails.getValue()} />,
  }),
  columnHelper.accessor('phones', {
    header: 'Phone',
    cell: (phones) => <PhoneList phones={phones.getValue()} />,
  }),
  columnHelper.accessor(
    (row) => row.deals.filter((deal) => deal.status !== 'OPEN').length,
    {
      id: 'closedDeals',
      header: 'Closed Deals',
      enableSorting: true,
      cell: (closedDeals) => (
        <span
          className={
            closedDeals.getValue() > 0
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground/60'
          }
        >
          {closedDeals.getValue()}
        </span>
      ),
    }
  ),
  columnHelper.accessor(
    (row) => row.deals.filter((deal) => deal.status === 'OPEN').length,
    {
      id: 'openDeals',
      header: 'Open Deals',
      enableSorting: true,
      cell: (openDeals) => (
        <span
          className={
            openDeals.getValue() > 0
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground/60'
          }
        >
          {openDeals.getValue()}
        </span>
      ),
    }
  ),
];

export function PeopleTable({ people }: { people: PersonTableSelect[] }) {
  return (
    <Table<PersonTableSelect>
      columns={columns}
      data={people}
      className="mt-4"
      defaultSortBy="name"
      defaultSortDir="asc"
    />
  );
}
