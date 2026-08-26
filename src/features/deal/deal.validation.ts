import { z } from 'zod';

import {
  DealStatus,
  PipelineStage,
  PriorityLevel,
} from '@/generated/prisma/enums';

export const BaseDealSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).trim(),
  value: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Amount must be a valid positive number',
    }),
  currency: z.string().length(3).trim().toUpperCase(),
  note: z.string().max(1000).trim().optional().or(z.literal('')),
  personId: z.string().min(1, 'Contact person is required').trim(),
  organizationId: z.string().min(1, 'Organization is required').trim(),
  stage: z.enum(PipelineStage).optional(),
  status: z.enum(DealStatus).optional(),
  priority: z.enum(PriorityLevel).optional(),

  expectedCloseDate: z.coerce.date().optional().nullable(),
});

export const CreateDealSchema = BaseDealSchema.refine(
  (data) => {
    if (!data.expectedCloseDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.expectedCloseDate >= today;
  },
  {
    message: 'Expected close date cannot be in the past',
    path: ['expectedCloseDate'],
  }
);

export const UpdateDealSchema = BaseDealSchema;

export const UpdateDealStatusSchema = z.object({
  id: z.cuid2('Invalid Deal ID').trim(),
  status: z.enum(DealStatus),
});

export const DeleteDealSchema = z.object({
  id: z.cuid2('Invalid Deal ID').trim(),
});

export type BaseDealValues = z.infer<typeof BaseDealSchema>;
export type CreateDealValues = z.infer<typeof CreateDealSchema>;
export type UpdateDealValues = z.infer<typeof UpdateDealSchema>;
export type UpdateDealStatusInput = z.infer<typeof UpdateDealStatusSchema>;
export type DeleteDealInput = z.infer<typeof DeleteDealSchema>;
