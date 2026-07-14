import { z } from 'zod';

import {
  DealStatusSchema,
  PipelineStageSchema,
  PriorityLevelSchema,
} from '@/generated/zod';

export const BaseDealSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters')
    .trim(),
  value: z.coerce
    .number('Value must be a number')
    .positive('Value must be positive'),
  currency: z.string().length(3, 'Currency must be a 3‑letter code').trim(),

  note: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  personId: z.string().min(1, 'Contact person is required').trim(),
  organizationId: z.string().min(1, 'Organization is required').trim(),

  stage: PipelineStageSchema.optional(),
  status: DealStatusSchema.optional(),
  priority: PriorityLevelSchema.optional(),
  expectedCloseDate: z.coerce
    .date('Expected close date is required')
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Expected close date cannot be in the past',
      path: ['expectedCloseDate'],
    }),
});

export const DealFormSchema = BaseDealSchema;

export type DealFormValues = z.infer<typeof DealFormSchema>;
export type BaseDealValues = z.infer<typeof BaseDealSchema>;

const allCodes = Intl.supportedValuesOf('currency');

const pinnedCurrencies = ['NZD', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export interface CurrencyOption {
  value: string;
  label: string;
  code: string;
  name: string;
  symbol: string;
}

const formatCurrencyOption = (code: string): CurrencyOption => {
  const nameFormatter = new Intl.DisplayNames(['en'], { type: 'currency' });
  const symbolFormatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: code,
  });

  const symbol =
    symbolFormatter.formatToParts(0).find((p) => p.type === 'currency')
      ?.value || '';
  const name = nameFormatter.of(code) || '';

  return {
    value: code,
    code,
    name,
    symbol,
    label: symbol ? `${code} - ${name} (${symbol})` : `${code} - ${name}`,
  };
};

export const PINNED_CURRENCY_OPTIONS =
  pinnedCurrencies.map(formatCurrencyOption);
export const REMAINING_CURRENCY_OPTIONS = allCodes
  .filter((code) => !pinnedCurrencies.includes(code))
  .map(formatCurrencyOption);
