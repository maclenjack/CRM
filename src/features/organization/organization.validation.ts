import { z } from 'zod';

export const OrganizationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),
});

export const DeleteOrganizationSchema = z.object({
  id: z.cuid2('Invalid Organization ID').trim(),
});

export type OrganizationFormValues = z.infer<typeof OrganizationFormSchema>;
export type DeleteOrganizationInput = z.infer<typeof DeleteOrganizationSchema>;
