import type {
  ActivityGetPayload,
  ActivitySelect,
} from '@/generated/prisma/models';

export const activityTableSelect = {
  id: true,
  subject: true,
  type: true,
  priority: true,
  startDate: true,
  endDate: true,
  isDone: true,
  deal: {
    select: {
      id: true,
      title: true,
    },
  },
  contactPerson: {
    select: {
      id: true,
      name: true,
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      emails: {
        select: {
          id: true,
          email: true,
          category: true,
        },
      },
      phones: {
        select: {
          id: true,
          phone: true,
          category: true,
        },
      },
    },
  },
  organization: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies ActivitySelect;

export type ActivityTableSelect = ActivityGetPayload<{
  select: typeof activityTableSelect;
}>;
