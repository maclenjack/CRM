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

// Re-export currency options from shared utility
export {
  PINNED_CURRENCY_OPTIONS,
  REMAINING_CURRENCY_OPTIONS,
  type CurrencyOption,
} from '@/features/shared/utils/currency';
