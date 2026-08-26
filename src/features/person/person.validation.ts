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
    countryCode: z.string(),
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

export const strictPhoneItemSchema = phoneItemSchema.superRefine(
  (data, ctx) => {
    if (!data.value) return;

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
  }
);

const emailItemSchema = z.object({
  type: z.enum(ContactCategory),
  value: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .superRefine((val, ctx) => {
      if (val.length === 0) return;

      const emailResult = z.email().safeParse(val);
      if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          message:
            'Please provide a valid email format (e.g., name@domain.com)',
        });
      }
    }),
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

export { phoneItemSchema, emailItemSchema };
