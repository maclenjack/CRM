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
  deal: {
    select: {
      title: true,
    },
  },
  contactPerson: {
    select: {
      name: true,
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
      name: true,
    },
  },
} satisfies ActivitySelect;

export type ActivityTableSelect = ActivityGetPayload<{
  select: typeof activityTableSelect;
}>;
