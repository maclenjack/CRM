import type { $ZodErrorTree } from 'zod/v4/core';

export interface BaseActionResult {
  success: boolean;
}

export type SuccessActionResult<TData = { id: string }> = [TData] extends [void]
  ? {
      success: true;
      data?: undefined;
    }
  : {
      success: true;
      data: TData;
    };

export interface ErrorActionResult<TInput = unknown> extends BaseActionResult {
  success: false;
  error?: string;
  validationErrors?: $ZodErrorTree<TInput>;
}

export type ActionResult<TInput = unknown, TData = { id: string }> =
  | SuccessActionResult<TData>
  | ErrorActionResult<TInput>;
