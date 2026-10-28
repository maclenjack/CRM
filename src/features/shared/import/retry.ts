import { Prisma } from '@/generated/prisma/client';

/**
 * Retry configuration
 */
export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  retryableErrors: [
    'P2034',
    'P2024',
    'P2028',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ],
  onRetry: (error, attempt) => {
    console.warn(`[RETRY] Attempt ${attempt} failed: ${error.message}`);
  },
};

/**
 * Prisma error codes that are retryable
 */
const RETRYABLE_PRISMA_CODES = new Set([
  'P2034', // Transaction conflict
  'P2024', // Connection timeout
  'P2028', // Transaction API error
  'P2030', // Full text search error
]);

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_PRISMA_CODES.has(error.code);
  }

  if (error instanceof Error) {
    // Check for network errors
    const networkErrors = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'EHOSTUNREACH',
    ];
    return networkErrors.some((code) => error.message.includes(code));
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  // Use crypto.getRandomValues for secure random instead of Math.random()
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const jitter = (randomBuffer[0] / 0xffffffff) * 0.3 * exponentialDelay; // 0-30% jitter
  const delay = Math.min(exponentialDelay + jitter, maxDelayMs);
  return Math.floor(delay);
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Check if error is retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Call retry callback
      config.onRetry(lastError, attempt + 1);

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        config.baseDelayMs,
        config.maxDelayMs
      );
      // eslint-disable-next-line compat/compat
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Wrapper for Prisma operations with retry
 */
export async function withPrismaRetry<T>(
  fn: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const prisma = (await import('@/lib/prisma')).default;
    return fn(prisma);
  }, options);
}

/**
 * Execute a Prisma transaction with retry
 */
export async function withTransactionRetry<T>(
  fn: (tx: any) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(async () => {
    const prisma = (await import('@/lib/prisma')).default;
    return prisma.$transaction(fn, {
      timeout: 60000,
      isolationLevel: 'ReadCommitted',
    });
  }, options);
}
