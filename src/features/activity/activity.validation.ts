import { z } from 'zod';

import { ActivityTypeSchema, PriorityLevelSchema } from '@/generated/zod';

export const BaseActivitySchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be under 100 characters')
    .trim(),

  type: ActivityTypeSchema,

  startDateTime: z.coerce
    .date({ message: 'Start date and time is required' })
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Start date cannot be in the past',
    }),

  endDateTime: z.coerce.date({ message: 'End date and time is required' }),

  priority: PriorityLevelSchema,

  note: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  dealId: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),

  personId: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),

  organizationId: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),
});

export const ActivityFormSchema = BaseActivitySchema.refine(
  (data) => data.endDateTime >= data.startDateTime,
  {
    message: 'End date and time cannot occur before the start date and time',
    path: ['endDateTime'],
  }
);

export type ActivityFormValues = z.infer<typeof ActivityFormSchema>;

export type BaseActivityValues = z.infer<typeof BaseActivitySchema>;
