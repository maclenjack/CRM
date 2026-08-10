export interface BaseActionResult {
  success: boolean;
}

export interface ErrorActionResult extends BaseActionResult {
  success: false;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

export interface SuccessActionResult<T = undefined> extends BaseActionResult {
  success: true;
  data?: T;
}

export type ActionResult<T = undefined> =
  | SuccessActionResult<T>
  | ErrorActionResult;
