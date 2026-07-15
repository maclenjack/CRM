'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Circle, ClipboardList, Mail, Phone, Users } from 'lucide-react';

import { Table } from '@/components/table/Table';
import type { ActivityTableSelect } from '@/features/activity/activity';
import { EmailList } from '@/features/person/components/EmailList';
import { PhoneList } from '@/features/person/components/PhoneList';
import { PriorityBadge } from '@/features/priority-level/components/PriorityBadge';
import { PriorityLevel } from '@/features/priority-level/priority-level';

const columnHelper = createColumnHelper<ActivityTableSelect>();

const ActivityIcon = ({ type }: { type: string }) => {
  const iconProps = { className: 'size-4 text-muted-foreground' };
  switch (type) {
    case 'CALL':
      return <Phone {...iconProps} />;
    case 'EMAIL':
      return <Mail {...iconProps} />;
    case 'MEETING':
      return <Users {...iconProps} />;
    case 'TASK':
      return <ClipboardList {...iconProps} />;
    default:
      return <ClipboardList {...iconProps} />;
  }
};

const columns = [
  columnHelper.display({
    id: 'done',
    header: 'Done',
    cell: () => (
      <div className="flex justify-center">
        <Circle className="size-5 cursor-pointer text-slate-300 hover:text-primary" />
      </div>
    ),
  }),
  columnHelper.accessor('subject', {
    header: 'Subject',
    cell: (info) => (
      <div className="flex items-center gap-3">
        <ActivityIcon type={info.row.original.type} />
        <span className="font-medium">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('deal', {
    header: 'Deal',
    enableSorting: true,
    cell: (deal) => deal.getValue()?.title,
  }),
  columnHelper.accessor('priority', {
    header: 'Priority',
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = PriorityLevel.fromValue(rowA.getValue(columnId));
      const valueB = PriorityLevel.fromValue(rowB.getValue(columnId));

      if (valueA.sortingValue < valueB.sortingValue) return -1;
      if (valueA.sortingValue > valueB.sortingValue) return 1;
      return 0;
    },
    cell: (priority) => <PriorityBadge priorityLevel={priority.getValue()} />,
  }),
  columnHelper.accessor('contactPerson', {
    id: 'contactPersonName',
    header: 'Contact',
    enableSorting: true,
    cell: (contactPerson) => contactPerson.getValue()?.name,
  }),
  columnHelper.accessor('contactPerson', {
    id: 'contactPersonEmails',
    header: 'Email',
    enableSorting: true,
    cell: (contactPerson) => {
      const emails = contactPerson.getValue()?.emails;
      if (!emails) return null;
      return <EmailList emails={emails} />;
    },
  }),
  columnHelper.accessor('contactPerson', {
    id: 'contactPersonPhones',
    header: 'Phone',
    enableSorting: true,
    cell: (contactPerson) => {
      const phones = contactPerson.getValue()?.phones;
      if (!phones) return null;
      return <PhoneList phones={phones} />;
    },
  }),
  columnHelper.accessor('organization', {
    header: 'Organization',
    enableSorting: true,
    cell: (organization) => organization.getValue()?.name,
  }),
  columnHelper.accessor('startDate', {
    header: 'Due Date',
    sortingFn: 'datetime',
    cell: (startDate) =>
      startDate.getValue().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    enableSorting: true,
  }),
];

export function ActivitiesTable({
  activities,
}: {
  activities: ActivityTableSelect[];
}) {
  return (
    <Table<ActivityTableSelect>
      columns={columns}
      data={activities}
      className="mt-4"
      defaultSortBy="startDate"
      defaultSortDir="asc"
    />
  );
}
