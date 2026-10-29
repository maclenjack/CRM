import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logger configuration
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Create a logger instance with correlation ID support
 */
export function createLogger(context: Record<string, unknown> = {}) {
  const logger = pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    base: {
      ...context,
      service: 'import-service',
    },
  });

  return logger;
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(
  parentLogger: pino.Logger,
  context: Record<string, unknown>
) {
  return parentLogger.child(context);
}

/**
 * Generate a correlation ID
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Logger instance for the import service
 */
export const importLogger = createLogger({ module: 'import' });

/**
 * Create a logger for a specific import session
 */
export function createSessionLogger(sessionId: string, userId: string) {
  return importLogger.child({
    sessionId,
    userId,
    correlationId: generateCorrelationId(),
  });
}

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
