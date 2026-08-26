// features/shared/actions/action-pipeline.ts
import z from 'zod';

import { auth } from '@/auth';
import type { ActionResult } from '@/features/shared/types/action-type';
import { Prisma } from '@/generated/prisma/client';

const UNAUTHORIZED_MSG = 'Unauthorized: You must be logged in.';

interface ActionPipelineOptions<TInput, TData> {
  schema: z.ZodType<TInput>;
  rawInput: unknown;
  actionName: string;
  handler: (validatedInput: TInput, userId: string) => Promise<TData>;
}

export async function actionPipeline<TInput, TData = { id: string }>({
  schema,
  rawInput,
  actionName,
  handler,
}: ActionPipelineOptions<TInput, TData>): Promise<ActionResult<TInput, TData>> {
  // 1. Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    console.warn(`[${actionName}] Unauthorized attempt`);
    return { success: false, error: UNAUTHORIZED_MSG };
  }

  const userId = session.user.id;

  // 2. Schema validation
  const parseResult = schema.safeParse(rawInput);
  if (!parseResult.success) {
    const validationErrors = z.treeifyError(parseResult.error);
    console.warn(`[${actionName}] Validation failed`, {
      userId,
      errors: validationErrors,
    });
    return {
      success: false,
      error: 'Validation failed',
      validationErrors,
    };
  }

  // 3. Handler execution & error boundaries
  try {
    const data = await handler(parseResult.data, userId);

    // Explicit return typed as ActionResult<TInput, TData>
    return {
      success: true,
      data,
    } as ActionResult<TInput, TData>;
  } catch (error) {
    // Handle Prisma P2025 (Record Not Found / Ownership mismatch)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      console.warn(`[${actionName}] Record not found or unauthorized`, {
        userId,
      });
      return {
        success: false,
        error: 'Record not found or you do not have permission to modify it.',
      };
    }

    console.error(`[${actionName}] Execution failed:`, error, { userId });
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
