import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ERROR_TYPES, HTTP_STATUS_CODES } from "./constants";

export interface ApiError extends Error {
  statusCode: number;
  type: string;
  details?: Record<string, unknown>;
}

/**
 * Base application error
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  type: string;
  details?: Record<string, unknown>;

 constructor(
  message: string,
  statusCode: number = HTTP_STATUS_CODES.SERVER_ERROR,
  type: string = ERROR_TYPES.INTERNAL_SERVER_ERROR,
  details?: Record<string, unknown>
) {
  super(message);

  this.statusCode = statusCode;
  this.type = type;
  this.details = details;

  Object.setPrototypeOf(this, new.target.prototype);
}
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      message,
      HTTP_STATUS_CODES.BAD_REQUEST,
      ERROR_TYPES.VALIDATION_ERROR,
      details
    );
  }
}

/**
 * Resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(
      `${resource} not found`,
      HTTP_STATUS_CODES.NOT_FOUND,
      ERROR_TYPES.NOT_FOUND_ERROR
    );
  }
}

/**
 * Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string) {
    super(
      message,
      HTTP_STATUS_CODES.RATE_LIMIT,
      ERROR_TYPES.RATE_LIMIT_ERROR
    );
  }
}

/**
 * Redis / Cache error
 */
export class RedisError extends AppError {
  constructor(message = "Cache operation failed") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.REDIS_ERROR
    );
  }
}

/**
 * AI Provider error
 */
export class LLMError extends AppError {
  constructor(message = "Failed to generate AI response") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.LLM_ERROR
    );
  }
}

/**
 * Convert unknown errors to AppError
 */
export function convertToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new ValidationError(
      "Validation failed",
      error.flatten().fieldErrors as Record<string, unknown>
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("An unexpected error occurred");
}

/**
 * Log errors
 */
export function logError(
  error: unknown,
  context: string,
  level: "error" | "warn" = "error"
) {
  const prefix = `[${new Date().toISOString()}] [${context}]`;

  if (error instanceof AppError) {
    console[level](prefix, {
      type: error.type,
      message: error.message,
      details: error.details,
    });
  } else {
    console[level](prefix, error);
  }
}

/**
 * Standard API error response
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse {
  const appError = convertToAppError(error);

  logError(appError, context);

  return NextResponse.json(
    {
      success: false,
      error: appError.message,
      type: appError.type,
      details: appError.details,
      ...(process.env.NODE_ENV === "development" && {
        stack: appError.stack,
      }),
    },
    {
      status: appError.statusCode,
    }
  );
}

/**
 * Async API wrapper
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<Response | NextResponse>,
  context: string
) {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}