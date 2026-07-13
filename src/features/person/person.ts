import type { PersonGetPayload, PersonSelect } from '@/generated/prisma/models';

export const personTableSelect = {
  name: true,
  organization: {
    select: {
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
  deals: {
    select: {
      status: true,
    },
  },
} satisfies PersonSelect;

export type PersonTableSelect = PersonGetPayload<{
  select: typeof personTableSelect;
}>;
