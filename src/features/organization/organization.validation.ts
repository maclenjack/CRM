import { z } from 'zod';

export const OrganizationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
});

export type OrganizationFormValues = z.infer<typeof OrganizationFormSchema>;
