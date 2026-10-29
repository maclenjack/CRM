'use client';

import { createColumnHelper } from '@tanstack/react-table';
import z from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { CellEditor } from '@/components/table/CellEditor';
import { Table } from '@/components/table/Table';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { EmailList } from '@/features/person/components/EmailList';
import { PersonRowActions } from '@/features/person/components/PersonRowActions';
import { PhoneList } from '@/features/person/components/PhoneList';
import type { PersonTableSelect } from '@/features/person/person';
import { updatePerson } from '@/features/person/person.actions';
import { PersonFormSchema } from '@/features/person/person.validation';

const columnHelper = createColumnHelper<PersonTableSelect>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: true,
    cell: (info) => {
      const personId = info.row.original.id;
      const currentName = info.getValue();

      return (
        <CellEditor
          label="Person Name"
          placeholder="Enter name..."
          value={currentName}
          schema={PersonFormSchema.shape.name}
          onSave={async (newName) => {
            const result = await updatePerson(personId, { name: newName });
            if (!result.success) {
              throw new Error(result.error || 'Failed to update person name');
            }
          }}
        />
      );
    },
  }),
  columnHelper.accessor('organization', {
    header: 'Organization',
    enableSorting: true,
    cell: (info) => {
      const currentOrganization = info.getValue();
      const personId = info.row.original.id;

      return (
        <CellEditor
          label="Organization"
          value={currentOrganization?.id || ''}
          displayValue={
            currentOrganization?.name || (
              <span className="text-slate-400 italic">
                No organization attached
              </span>
            )
          }
          schema={z.string().optional().nullable()}
          onSave={async (newOrganizationId) => {
            const result = await updatePerson(personId, {
              organizationId:
                newOrganizationId === '' ? null : newOrganizationId,
            });
            if (!result.success) {
              throw new Error(result.error || 'Failed to update organization');
            }
          }}
          renderInput={({ value, onChange, disabled }) => (
            <AsyncCombobox
              value={value as string}
              initialLabel={currentOrganization?.name}
              onChange={onChange}
              disabled={disabled}
              placeholder="Search organizations..."
              fetchOptions={searchOrganizations}
              mapOption={mapOrganizationToOption}
            />
          )}
        />
      );
    },
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
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <PersonRowActions person={info.row.original} />,
  }),
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
