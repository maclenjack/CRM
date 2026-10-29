import { z } from 'zod';

/**
 * Pipedrive Organization CSV row schema (raw CSV columns)
 * Actual Pipedrive export uses "Organization - " prefix for all columns
 */
export const PipedriveOrganizationCsvSchema = z.object({
  'Organization - ID': z.string().min(1, 'Pipedrive ID is required'),
  'Organization - Name': z.string().min(1, 'Name is required').max(200),
  'Organization - Owner': z.string().optional().or(z.literal('')),
});

export type PipedriveOrganizationCsvRow = z.infer<
  typeof PipedriveOrganizationCsvSchema
>;

/**
 * Transformed organization data ready for internal create/update
 */
export const TransformedOrganizationSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1).max(200),
  ownerExternalId: z.string().optional(),
});

export type TransformedOrganization = z.infer<
  typeof TransformedOrganizationSchema
>;

/**
 * Transform Pipedrive CSV row to internal format
 */
export function transformOrganization(
  row: PipedriveOrganizationCsvRow
): TransformedOrganization {
  return {
    externalId: row['Organization - ID'],
    name: row['Organization - Name'].trim(),
    ownerExternalId: row['Organization - Owner'] || undefined, // Owner name, will map to current user
  };
}

/**
 * Validate and transform a batch of rows
 */
export function validateAndTransformOrganizations(
  rows: PipedriveOrganizationCsvRow[]
): {
  valid: TransformedOrganization[];
  invalid: Array<{ row: PipedriveOrganizationCsvRow; errors: string[] }>;
} {
  const valid: TransformedOrganization[] = [];
  const invalid: Array<{ row: PipedriveOrganizationCsvRow; errors: string[] }> =
    [];

  for (const row of rows) {
    const result = PipedriveOrganizationCsvSchema.safeParse(row);
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
      valid.push(transformOrganization(result.data));
    } catch (error) {
      invalid.push({
        row,
        errors: [error instanceof Error ? error.message : 'Transform failed'],
      });
    }
  }

  return { valid, invalid };
}
