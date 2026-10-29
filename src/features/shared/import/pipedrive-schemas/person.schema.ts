import { z } from 'zod';

import { ContactCategory } from '@/generated/prisma/enums';

/**
 * Pipedrive Person CSV row schema (raw CSV columns)
 * Actual Pipedrive export uses "Person - " prefix for all columns
 */
export const PipedrivePersonCsvSchema = z.object({
  'Person - ID': z.string().min(1, 'Pipedrive ID is required'),
  'Person - Name': z.string().min(1, 'Name is required').max(70),
  'Person - Email - Work': z
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  'Person - Email - Home': z
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  'Person - Email - Other': z
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  'Person - Phone - Work': z.string().optional().or(z.literal('')),
  'Person - Phone - Home': z.string().optional().or(z.literal('')),
  'Person - Phone - Mobile': z.string().optional().or(z.literal('')),
  'Person - Phone - Other': z.string().optional().or(z.literal('')),
  'Person - Organization': z.string().optional().or(z.literal('')),
  'Person - Organization ID': z.string().optional().or(z.literal('')),
  'Person - Owner': z.string().optional().or(z.literal('')),
});

export type PipedrivePersonCsvRow = z.infer<typeof PipedrivePersonCsvSchema>;

/**
 * Transformed person data ready for internal create/update
 */
export const TransformedPersonSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1).max(70),
  emails: z
    .array(
      z.object({
        value: z.string().email(),
        category: z.enum(ContactCategory).default('WORK'),
      })
    )
    .optional()
    .default([]),
  phones: z
    .array(
      z.object({
        value: z.string().min(1),
        category: z.enum(ContactCategory).default('WORK'),
      })
    )
    .optional()
    .default([]),
  organizationExternalId: z.string().optional(),
  ownerExternalId: z.string().optional(),
});

export type TransformedPerson = z.infer<typeof TransformedPersonSchema>;

/**
 * Transform Pipedrive CSV row to internal format
 */
export function transformPerson(row: PipedrivePersonCsvRow): TransformedPerson {
  const emails: Array<{ value: string; category: ContactCategory }> = [];

  // Collect all emails from different columns
  if (row['Person - Email - Work']?.trim()) {
    emails.push({
      value: row['Person - Email - Work']!.trim(),
      category: 'WORK',
    });
  }
  if (row['Person - Email - Home']?.trim()) {
    emails.push({
      value: row['Person - Email - Home']!.trim(),
      category: 'PERSONAL',
    });
  }
  if (row['Person - Email - Other']?.trim()) {
    emails.push({
      value: row['Person - Email - Other']!.trim(),
      category: 'OTHER',
    });
  }

  const phones: Array<{ value: string; category: ContactCategory }> = [];

  // Collect all phones from different columns
  if (row['Person - Phone - Work']?.trim()) {
    phones.push({
      value: row['Person - Phone - Work']!.trim(),
      category: 'WORK',
    });
  }
  if (row['Person - Phone - Home']?.trim()) {
    phones.push({
      value: row['Person - Phone - Home']!.trim(),
      category: 'PERSONAL',
    });
  }
  if (row['Person - Phone - Mobile']?.trim()) {
    phones.push({
      value: row['Person - Phone - Mobile']!.trim(),
      category: 'WORK',
    });
  }
  if (row['Person - Phone - Other']?.trim()) {
    phones.push({
      value: row['Person - Phone - Other']!.trim(),
      category: 'OTHER',
    });
  }

  return {
    externalId: row['Person - ID'],
    name: row['Person - Name'].trim(),
    emails,
    phones,
    organizationExternalId: row['Person - Organization ID'] || undefined,
    ownerExternalId: row['Person - Owner'] || undefined, // Owner name, will map to current user
  };
}

/**
 * Validate and transform a batch of rows
 */
export function validateAndTransformPersons(rows: PipedrivePersonCsvRow[]): {
  valid: TransformedPerson[];
  invalid: Array<{ row: PipedrivePersonCsvRow; errors: string[] }>;
} {
  const valid: TransformedPerson[] = [];
  const invalid: Array<{ row: PipedrivePersonCsvRow; errors: string[] }> = [];

  for (const row of rows) {
    const result = PipedrivePersonCsvSchema.safeParse(row);
    if (!result.success) {
      invalid.push({
        row,
        errors: result.error.issues.map(
          (i) => `${i.path.join('.')}: ${i.message}`
        ),
      });
      continue;
    }

    try {
      valid.push(transformPerson(result.data));
    } catch (error) {
      invalid.push({
        row,
        errors: [error instanceof Error ? error.message : 'Transform failed'],
      });
    }
  }

  return { valid, invalid };
}
