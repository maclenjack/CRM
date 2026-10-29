import z from 'zod';

export const DeleteUserSchema = z.object({
  id: z.cuid2('Invalid Organization ID').trim(),
});

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;
