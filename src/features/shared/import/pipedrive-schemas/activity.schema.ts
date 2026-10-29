import { z } from 'zod';

import { ActivityType } from '@/generated/prisma/enums';

/**
 * Pipedrive Activity CSV row schema (raw CSV columns)
 * Actual Pipedrive export uses "Activity - " prefix for all columns
 */
export const PipedriveActivityCsvSchema = z.object({
  'Activity - ID': z.string().min(1, 'Pipedrive ID is required'),
  'Activity - Subject': z.string().min(1, 'Subject is required').max(100),
  'Activity - Type': z.string().optional().default('Task'),
  'Activity - Done': z.string().optional().or(z.literal('')).default('0'),
  'Activity - Deal ID': z.string().optional().or(z.literal('')),
  'Activity - Contact person ID': z.string().optional().or(z.literal('')),
  'Activity - Organization ID': z.string().optional().or(z.literal('')),
  'Activity - Assigned to user': z.string().optional().or(z.literal('')),
  'Activity - Due date': z.string().optional().or(z.literal('')),
  'Activity - Due time': z.string().optional().or(z.literal('')),
  'Activity - Duration': z.string().optional().or(z.literal('')),
  'Activity - Note': z.string().optional().or(z.literal('')),
});

export type PipedriveActivityCsvRow = z.infer<
  typeof PipedriveActivityCsvSchema
>;

/**
 * Transformed activity data ready for internal create/update
 */
export const TransformedActivitySchema = z.object({
  externalId: z.string().min(1),
  subject: z.string().min(1).max(100),
  type: z.enum(ActivityType).default('TASK'),
  startDate: z.date(),
  endDate: z.date(),
  isDone: z.boolean().default(false),
  dealExternalId: z.string().optional(),
  personExternalId: z.string().optional(),
  organizationExternalId: z.string().optional(),
  ownerExternalId: z.string().optional(),
});

export type TransformedActivity = z.infer<typeof TransformedActivitySchema>;

/**
 * Transform Pipedrive CSV row to internal format
 */
export function transformActivity(
  row: PipedriveActivityCsvRow
): TransformedActivity {
  const typeMap: Record<string, ActivityType> = {
    Call: 'CALL',
    Meeting: 'MEETING',
    Task: 'TASK',
    Deadline: 'DEADLINE',
    Email: 'EMAIL',
    Lunch: 'LUNCH',
  };

  const parseDate = (value: string): Date => {
    if (!value || value.trim() === '') return new Date();
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Parse due date and time
  const dueDateStr = row['Activity - Due date'] ?? '';
  const dueTimeStr = row['Activity - Due time'] ?? '';
  let dueDate = new Date();

  if (dueDateStr.trim()) {
    // Combine date and time if both present
    if (dueTimeStr.trim()) {
      const [hours, minutes] = dueTimeStr.split(':').map(Number);
      dueDate = new Date(dueDateStr);
      dueDate.setHours(hours || 0, minutes || 0, 0, 0);
    } else {
      dueDate = parseDate(dueDateStr);
    }
  }

  return {
    externalId: row['Activity - ID'],
    subject: row['Activity - Subject'].trim(),
    type: typeMap[row['Activity - Type']?.trim()] || 'TASK',
    startDate: dueDate,
    endDate: dueDate,
    isDone:
      row['Activity - Done'] === '1' ||
      row['Activity - Done']?.toLowerCase() === 'true',
    dealExternalId: row['Activity - Deal ID'] || undefined,
    personExternalId: row['Activity - Contact person ID'] || undefined,
    organizationExternalId: row['Activity - Organization ID'] || undefined,
    ownerExternalId: row['Activity - Assigned to user'] || undefined, // Owner name, will map to current user
  };
}

/**
 * Validate and transform a batch of rows
 */
export function validateAndTransformActivities(
  rows: PipedriveActivityCsvRow[]
): {
  valid: TransformedActivity[];
  invalid: Array<{ row: PipedriveActivityCsvRow; errors: string[] }>;
} {
  const valid: TransformedActivity[] = [];
  const invalid: Array<{ row: PipedriveActivityCsvRow; errors: string[] }> = [];

  for (const row of rows) {
    const result = PipedriveActivityCsvSchema.safeParse(row);
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
      valid.push(transformActivity(result.data));
    } catch (error) {
      invalid.push({
        row,
        errors: [error instanceof Error ? error.message : 'Transform failed'],
      });
    }
  }

  return { valid, invalid };
}
