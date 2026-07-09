'use client';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { Table } from '@/components/Table';
import { PriorityLevel } from '@/models';
import type { Activity } from '@/types/activity';
import { ActivityType } from '@/types/enums';

const mockActivities: Activity[] = [
  {
    id: '1',
    subject: 'Follow up on proposal',
    type: ActivityType.CALL,
    done: false,
    deal: 'Deal #123',
    priority: PriorityLevel.HIGH,
    contactPerson: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1 555 1234',
    organization: 'Acme Corp',
    dueDate: '2026-05-30',
  },
  {
    id: '2',
    type: ActivityType.MEETING,
    done: true,
    subject: 'Schedule demo',
    deal: 'Deal #456',
    priority: PriorityLevel.MEDIUM,
    contactPerson: 'Bob Johnson',
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
    { header: 'Contact', accessor: 'contactPerson', sortable: true },
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
