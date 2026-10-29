import { z } from 'zod';

export const MoveCardSchema = z.object({
  cardId: z.cuid2({ message: 'Invalid card ID format' }),
  targetColumnId: z.string().min(1, 'Target column ID cannot be empty'),
  position: z.number({ error: 'Position must be a number' }),
  needsReindex: z.boolean().optional(),
});

export type MoveCardInput = z.infer<typeof MoveCardSchema>;
