import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { Table } from '@/components/Table';
import { PriorityLevel } from '@/types';

export interface Activity {
  id: number;
  done: boolean;
  subject: string;
  deal: string;
  priority: PriorityLevel;
  contact: string;
  email: string;
  phone: string;
  organization: string;
  dueDate: string;
}

export const mockActivities: Activity[] = [
  {
    id: 1,
    done: false,
    subject: 'Follow up on proposal',
    deal: 'Deal #123',
    priority: PriorityLevel.HIGH,
    contact: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1 555 1234',
    organization: 'Acme Corp',
    dueDate: '2026-05-30',
  },
  {
    id: 2,
    done: true,
    subject: 'Schedule demo',
    deal: 'Deal #456',
    priority: PriorityLevel.MEDIUM,
    contact: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 555 5678',
    organization: 'Beta Ltd',
    dueDate: '2026-05-25',
  },
];

export function ActivityTable() {
  const columns: Array<{
    header: string;
    accessor: keyof Activity;
    className?: string;
    formatter?: (
      value: Activity[keyof Activity],
      row: Activity
    ) => React.ReactNode;
    sortable?: boolean;
  }> = [
    {
      header: 'Done',
      accessor: 'done',
      className: 'w-12 text-center',
      sortable: true,
      formatter: (value) => {
        return (
          <div className="flex h-full items-center justify-center">
            <span
              className={clsx(
                'inline-flex size-6 items-center justify-center rounded-sm',
                value ? 'text-success' : 'text-danger'
              )}
              aria-label={value ? 'Completed' : 'Not completed'}
            >
              {value ? (
                <CheckCircleIcon className="size-6" />
              ) : (
                <XCircleIcon className="size-6" />
              )}
            </span>
          </div>
        );
      },
    },
    { header: 'Subject', accessor: 'subject', sortable: true },
    { header: 'Deal', accessor: 'deal', sortable: true },
    { header: 'Priority', accessor: 'priority', sortable: true },
    { header: 'Contact', accessor: 'contact', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Phone', accessor: 'phone', sortable: true },
    { header: 'Organization', accessor: 'organization', sortable: true },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      formatter: (value) => {
        const d = new Date(value as string);
        return new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
        }).format(d);
      },
      sortable: true,
    },
  ];

  return (
    <Table<Activity>
      columns={columns}
      data={mockActivities}
      className="mt-4"
      defaultSortBy="dueDate"
      defaultSortDir="asc"
    />
  );
}
