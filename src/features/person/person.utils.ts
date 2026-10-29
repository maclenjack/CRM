'use client';

import type { FieldValues } from 'react-hook-form';

import type { PersonTableSelect } from '@/features/person/person';
import type { PersonFormValues } from '@/features/person/person.validation';
import { ContactCategory as PrismaContactCategory } from '@/generated/prisma/enums';

export type PersonModalInitialValues = PersonFormValues & {
  id?: string;
  organizationName?: string | null;
};

export function getPersonInitialValues(
  person: PersonTableSelect
): PersonModalInitialValues {
  return {
    id: person.id,
    name: person.name,
    organizationId: person.organization?.id ?? '',
    organizationName: person.organization?.name ?? null,
    phones: person.phones.map((p) => ({
      value: p.phone,
      type: p.category as PrismaContactCategory,
      countryCode: 'NZ',
    })),
    emails: person.emails.map((e) => ({
      value: e.email,
      type: e.category as PrismaContactCategory,
    })),
  };
}

export function getArrayFieldError<
  TFieldValues extends FieldValues,
  TArrayPath extends string,
>(
  errors: import('react-hook-form').FieldErrors<TFieldValues> | undefined,
  arrayPath: TArrayPath,
  index: number
): Record<string, { message?: string }> | undefined {
  const arrayErrors = errors?.[arrayPath] as
    | Array<Record<string, { message?: string }>>
    | undefined;
  return arrayErrors?.[index];
}
