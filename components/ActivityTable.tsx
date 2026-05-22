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
  }> = [
    { header: 'Done', accessor: 'done', className: 'w-12' },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Deal', accessor: 'deal' },
    { header: 'Priority', accessor: 'priority' },
    { header: 'Contact', accessor: 'contact' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Organization', accessor: 'organization' },
    { header: 'Due Date', accessor: 'dueDate' },
  ];

  return (
    <Table<Activity> columns={columns} data={mockActivities} className="mt-4" />
  );
}
