'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { ClipboardList, Mail, Phone, Users } from 'lucide-react';
import z from 'zod';

import { AsyncCombobox } from '@/components/form/AsyncCombobox';
import { CellEditor } from '@/components/table/CellEditor';
import { Table } from '@/components/table/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActivityTableSelect } from '@/features/activity/activity';
import { updateActivity } from '@/features/activity/activity.actions';
import { UpdateActivitySchema } from '@/features/activity/activity.validation';
import { ActivityRowActions } from '@/features/activity/components/ActivityRowActions';
import { ActivityTypeBadge } from '@/features/activity/components/ActivityTypeBadge';
import { DoneToggle } from '@/features/activity/components/DoneToggle';
import { mapDealToOption } from '@/features/deal/deal';
import { searchDeals } from '@/features/deal/deal.actions';
import { mapOrganizationToOption } from '@/features/organization/organization';
import { searchOrganizations } from '@/features/organization/organization.actions';
import { EmailList } from '@/features/person/components/EmailList';
import { PhoneList } from '@/features/person/components/PhoneList';
import { mapPersonToOption } from '@/features/person/person';
import { searchPeople } from '@/features/person/person.actions';
import { PriorityBadge } from '@/features/priority-level/components/PriorityBadge';
import { PriorityLevel } from '@/features/priority-level/priority-level';
import { formatDuration } from '@/features/shared/utils/date';
import { PriorityLevel as PrismaPriorityLevel } from '@/generated/prisma/enums';
import { ActivityType } from '@/generated/prisma/enums';

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
    cell: (info) => (
      <DoneToggle
        activityId={info.row.original.id}
        isDone={info.row.original.isDone}
      />
    ),
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    enableSorting: true,
    cell: (info) => (
      <ActivityTypeBadge type={info.getValue() as ActivityType} />
    ),
  }),
  columnHelper.accessor('subject', {
    header: 'Subject',
    cell: (info) => (
      <div className="flex w-full items-center gap-2">
        <ActivityIcon type={info.row.original.type} />

        <CellEditor
          label="Subject"
          placeholder="Enter a subject..."
          value={info.getValue()}
          schema={UpdateActivitySchema.shape.subject}
          onSave={async (newSubject) => {
            const result = await updateActivity(info.row.original.id, {
              subject: newSubject,
            });

            if (!result.success) {
              throw new Error(result.error || 'Failed to update subject');
            }
          }}
        />
      </div>
    ),
  }),
  columnHelper.accessor('deal', {
    header: 'Deal',
    enableSorting: true,
    cell: (info) => {
      const currentDeal = info.getValue();

      return (
        <CellEditor
          label="Deal"
          value={currentDeal?.id || ''}
          displayValue={
            currentDeal?.title || (
              <span className="text-slate-400 italic">No deal attached</span>
            )
          }
          schema={z.cuid2().optional().nullable()}
          onSave={async (newDealId) => {
            const result = await updateActivity(info.row.original.id, {
              dealId: newDealId,
            });
            if (!result.success) throw new Error('Failed to update deal');
          }}
          renderInput={({ value, onChange, disabled }) => (
            <AsyncCombobox
              value={value as string}
              initialLabel={currentDeal?.title}
              onChange={onChange}
              disabled={disabled}
              placeholder="Search deals..."
              fetchOptions={searchDeals}
              mapOption={mapDealToOption}
            />
          )}
        />
      );
    },
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
    cell: (info) => {
      const currentPriority = info.getValue();
      const activityId = info.row.original.id;

      return (
        <CellEditor
          label="Priority"
          value={currentPriority}
          displayValue={<PriorityBadge priorityLevel={currentPriority} />}
          schema={z.enum(PrismaPriorityLevel)}
          onSave={async (newPriority) => {
            const result = await updateActivity(activityId, {
              priority: newPriority,
            });
            if (!result.success) {
              throw new Error(result.error || 'Failed to update priority');
            }
          }}
          renderInput={({ value, onChange, disabled }) => (
            <Select
              value={value as string}
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Select priority..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      );
    },
  }),
  columnHelper.accessor('contactPerson', {
    id: 'contactPersonName',
    header: 'Contact',
    enableSorting: true,
    cell: (info) => {
      const currentPerson = info.getValue();
      const activityId = info.row.original.id;

      return (
        <CellEditor
          label="Contact Person"
          value={currentPerson?.id || ''}
          displayValue={
            currentPerson ? (
              <span className="truncate font-medium">{currentPerson.name}</span>
            ) : (
              <span className="text-slate-400 italic">No contact attached</span>
            )
          }
          schema={z.string().optional().nullable()}
          onSave={async (newPersonId) => {
            const result = await updateActivity(activityId, {
              personId: newPersonId === '' ? null : newPersonId,
            });
            if (!result.success)
              throw new Error('Failed to update contact person');
          }}
          renderInput={({ value, onChange, disabled }) => (
            <AsyncCombobox
              value={value as string}
              initialLabel={currentPerson?.name}
              onChange={onChange}
              disabled={disabled}
              placeholder="Search people..."
              fetchOptions={searchPeople}
              mapOption={mapPersonToOption}
            />
          )}
        />
      );
    },
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
    cell: (info) => {
      const currentOrganization = info.getValue();

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
          schema={z.cuid2().optional().nullable()}
          onSave={async (newOrganizationId) => {
            const result = await updateActivity(info.row.original.id, {
              organizationId: newOrganizationId,
            });
            if (!result.success)
              throw new Error('Failed to update organization');
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
  columnHelper.accessor('startDate', {
    header: 'Due Date',
    sortingFn: 'datetime',
    cell: (startDate) =>
      startDate.getValue().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    enableSorting: true,
  }),
  columnHelper.display({
    header: 'Duration',
    sortingFn: 'datetime',
    cell: (tableDataRow) =>
      formatDuration(
        tableDataRow.row.original.startDate,
        tableDataRow.row.original.endDate
      ),
    enableSorting: true,
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => <ActivityRowActions activity={info.row.original} />,
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
