import { z } from 'zod';

import { ActivityType, PriorityLevel } from '@/generated/prisma/enums';

const optionalIdSchema = z
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .nullable()
  .optional();

export const BaseActivitySchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(100, 'Subject must be under 100 characters')
    .trim(),

  type: z.enum(ActivityType, {
    message: 'Invalid activity type',
  }),

  startDateTime: z.coerce.date({
    message: 'Start date and time is required',
  }),

  endDateTime: z.coerce.date({
    message: 'End date and time is required',
  }),

  priority: z.enum(PriorityLevel, {
    message: 'Invalid priority level',
  }),

  note: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  dealId: optionalIdSchema,
  personId: optionalIdSchema,
  organizationId: optionalIdSchema,
});

export const ActivityFormSchema = BaseActivitySchema.refine(
  (data) => data.endDateTime >= data.startDateTime,
  {
    message: 'End date and time cannot occur before the start date and time',
    path: ['endDateTime'],
  }
);

export const UpdateActivitySchema = BaseActivitySchema.partial()
  .extend({
    id: z.cuid2().min(1, 'Activity ID is required'),
    isDone: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    const start = data.startDateTime ?? data.startDate;
    const end = data.endDateTime ?? data.endDate;

    if (start && end && end < start) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date and time cannot occur before start date and time',
        path: ['endDateTime'],
      });
    }
  });

export const DeleteActivitySchema = z.object({
  id: z.cuid2().min(1, 'Invalid activity ID'),
});

export type ActivityFormValues = z.infer<typeof ActivityFormSchema>;
export type BaseActivityValues = z.infer<typeof BaseActivitySchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivitySchema>;
export type DeleteActivityInput = z.infer<typeof DeleteActivitySchema>;
