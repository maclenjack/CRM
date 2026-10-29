import { z } from 'zod';

/**
 * Schema for import person CSV file upload
 */
export const ImportPeopleSchema = z.object({
  sessionId: z.string().cuid2(),
  csvContent: z.string().min(1, 'CSV content is required'),
});

export type ImportPeopleInput = z.infer<typeof ImportPeopleSchema>;

/**
 * Schema for import organization CSV file upload
 */
export const ImportOrganizationsSchema = z.object({
  sessionId: z.string().cuid2(),
  csvContent: z.string().min(1, 'CSV content is required'),
});

export type ImportOrganizationsInput = z.infer<
  typeof ImportOrganizationsSchema
>;

/**
 * Schema for import deal CSV file upload
 */
export const ImportDealsSchema = z.object({
  sessionId: z.string().cuid2(),
  csvContent: z.string().min(1, 'CSV content is required'),
});

export type ImportDealsInput = z.infer<typeof ImportDealsSchema>;

/**
 * Schema for import activity CSV file upload
 */
export const ImportActivitiesSchema = z.object({
  sessionId: z.string().cuid2(),
  csvContent: z.string().min(1, 'CSV content is required'),
});

export type ImportActivitiesInput = z.infer<typeof ImportActivitiesSchema>;
