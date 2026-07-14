import type {
  PersonEmailModel,
  PersonGetPayload,
  PersonModel,
  PersonSelect,
} from '@/generated/prisma/models';

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

export type PersonWithEmails = Pick<PersonModel, 'id' | 'name'> & {
  emails: Pick<PersonEmailModel, 'email'>[];
};

export function mapPersonToOption(person: PersonWithEmails) {
  const firstEmail = person.emails?.[0]?.email;

  return {
    value: person.id,
    label: person.name,
    description: firstEmail || 'No email attached',
  };
}
