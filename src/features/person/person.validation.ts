import {
  type CountryCode,
  isPossiblePhoneNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import { z } from 'zod';

import { ContactCategory } from '@/generated/prisma/enums';

const phoneItemSchema = z
  .object({
    type: z.enum(ContactCategory),
    countryCode: z.string().default('US'),
    value: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (!data.value) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Phone number is required',
      });
      return;
    }

    const possible = isPossiblePhoneNumber(
      data.value,
      data.countryCode as CountryCode
    );
    if (!possible) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'Invalid phone number layout for this region.',
      });
      return;
    }

    const phoneNumber = parsePhoneNumberFromString(
      data.value,
      data.countryCode as CountryCode
    );
    if (!phoneNumber || !phoneNumber.isValid()) {
      ctx.addIssue({
        code: 'custom',
        path: ['value'],
        message: 'The number entered is invalid or does not exist.',
      });
    }
  })
  .transform((data) => {
    const phoneNumber = parsePhoneNumberFromString(
      data.value,
      data.countryCode as CountryCode
    );

    return {
      type: data.type,
      countryCode: data.countryCode,
      value: phoneNumber ? phoneNumber.number : data.value,
    };
  });

const emailItemSchema = z.object({
  type: z.enum(ContactCategory),
  value: z
    .email('Please provide a valid email format (e.g., name@domain.com)')
    .trim()
    .min(1, 'Email address is required'),
});

export const PersonFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(70, 'Name cannot exceed 70 characters'),
  organizationId: z.string().nullable().optional(),
  phones: z.array(phoneItemSchema),
  emails: z.array(emailItemSchema),
});

export const DeletePersonSchema = z.object({
  id: z.cuid2('Invalid Person ID').trim(),
});

export type PersonFormValues = z.infer<typeof PersonFormSchema>;
export type DeletePersonInput = z.infer<typeof DeletePersonSchema>;
