import { z } from 'zod';

export const MoveCardSchema = z.object({
  cardId: z.cuid2({ message: 'Invalid card ID format' }),
  targetColumnId: z.string().min(1, 'Target column ID cannot be empty'),
  targetPosition: z.number({
    error: 'Target position must be a number',
  }),
});

export type MoveCardInput = z.infer<typeof MoveCardSchema>;
