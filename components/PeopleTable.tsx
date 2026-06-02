import { ReactNode } from 'react';

import { Table, TableColumn } from '@/components/Table';
import { Visibility } from '@/types/enums';
import { Person } from '@/types/person';

export interface PeopleTableProps {
  children?: ReactNode;
}

const mockPeople: Person[] = [
  {
    id: '1',
    name: 'John Doe',
    organization: 'Acme Corp',
    email: 'john@example.com',
    phone: '+1 555 1234',
    closedDeals: 3,
    openDeals: 5,
    labels: [],
    owner: 'john',
    visibleTo: Visibility.ALL_USERS,
  },
  {
    id: '2',
    name: 'Jane Smith',
    organization: 'Beta Ltd',
    email: 'jane@example.com',
    phone: '+1 555 5678',
    closedDeals: 1,
    openDeals: 2,
    labels: [],
    owner: 'jane',
    visibleTo: Visibility.ONLY_OWNER,
  },
];

const columns: TableColumn<Person>[] = [
  { header: 'Name', accessor: 'name', sortable: true },
  { header: 'Organization', accessor: 'organization', sortable: true },
  { header: 'Email', accessor: 'email', sortable: true },
  { header: 'Phone', accessor: 'phone', sortable: true },
  {
    header: 'Closed deals',
    accessor: 'closedDeals',
    className: 'text-right',
    sortable: true,
  },
  {
    header: 'Open deals',
    accessor: 'openDeals',
    className: 'text-right',
    sortable: true,
  },
];

export function PeopleTable({ children }: PeopleTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table<Person> columns={columns} data={mockPeople} />
      {children}
    </div>
  );
}
