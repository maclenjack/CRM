import { z } from 'zod';

import { DealStatus, PipelineStage } from '@/generated/prisma/enums';

/**
 * Pipedrive Deal CSV row schema (raw CSV columns)
 * Actual Pipedrive export uses "Deal - " prefix for all columns
 */
export const PipedriveDealCsvSchema = z.object({
  'Deal - ID': z.string().min(1, 'Pipedrive ID is required'),
  'Deal - Title': z.string().min(1, 'Title is required').max(200),
  'Deal - Value': z.string().optional().or(z.literal('')).default('0'),
  'Deal - Currency of Value': z.string().length(3).optional().default('NZD'),
  'Deal - Stage': z.string().optional().default('Qualified'),
  'Deal - Status': z.string().optional().default('Open'),
  'Deal - Expected close date': z.string().optional().or(z.literal('')),
  'Deal - Contact person ID': z.string().optional().or(z.literal('')),
  'Deal - Organization ID': z.string().optional().or(z.literal('')),
  'Deal - Owner': z.string().optional().or(z.literal('')),
});

export type PipedriveDealCsvRow = z.infer<typeof PipedriveDealCsvSchema>;

/**
 * Transformed deal data ready for internal create/update
 */
export const TransformedDealSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1).max(200),
  value: z.number().nonnegative(),
  currency: z.string().length(3).default('NZD'),
  stage: z.enum(PipelineStage).default('QUALIFIED'),
  status: z.enum(DealStatus).default('OPEN'),
  expectedCloseDate: z.date().nullable().optional(),
  personExternalId: z.string().optional(),
  organizationExternalId: z.string().optional(),
  ownerExternalId: z.string().optional(),
});

export type TransformedDeal = z.infer<typeof TransformedDealSchema>;

/**
 * Transform Pipedrive CSV row to internal format
 */
export function transformDeal(row: PipedriveDealCsvRow): TransformedDeal {
  const stageMap: Record<string, PipelineStage> = {
    Qualified: 'QUALIFIED',
    'Contact Made': 'CONTACT_MADE',
    'Demo Scheduled': 'DEMO_SCHEDULED',
    'Proposal Made': 'PROPOSAL_MADE',
    'Negotiations Started': 'NEGOTIATIONS_STARTED',
    Won: 'WON',
  };

  const statusMap: Record<string, DealStatus> = {
    Open: 'OPEN',
    Won: 'WON',
    Lost: 'LOST',
  };

  const parseDate = (value: string): Date | null => {
    if (!value || value.trim() === '') return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  return {
    externalId: row['Deal - ID'],
    title: row['Deal - Title'].trim(),
    value: parseFloat(row['Deal - Value'] || '0'),
    currency: row['Deal - Currency of Value'] || 'NZD',
    stage: stageMap[row['Deal - Stage']?.trim()] || 'QUALIFIED',
    status: statusMap[row['Deal - Status']?.trim()] || 'OPEN',
    expectedCloseDate: parseDate(row['Deal - Expected close date'] ?? ''),
    personExternalId: row['Deal - Contact person ID'] || undefined,
    organizationExternalId: row['Deal - Organization ID'] || undefined,
    ownerExternalId: row['Deal - Owner'] || undefined, // Owner name, will map to current user
  };
}

/**
 * Validate and transform a batch of rows
 */
export function validateAndTransformDeals(rows: PipedriveDealCsvRow[]): {
  valid: TransformedDeal[];
  invalid: Array<{ row: PipedriveDealCsvRow; errors: string[] }>;
} {
  const valid: TransformedDeal[] = [];
  const invalid: Array<{ row: PipedriveDealCsvRow; errors: string[] }> = [];

  for (const row of rows) {
    const result = PipedriveDealCsvSchema.safeParse(row);
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
      valid.push(transformDeal(result.data));
    } catch (error) {
      invalid.push({
        row,
        errors: [error instanceof Error ? error.message : 'Transform failed'],
      });
    }
  }

  return { valid, invalid };
}
