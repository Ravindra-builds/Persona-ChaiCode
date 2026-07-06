import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ERROR_TYPES, HTTP_STATUS_CODES } from "./constants";

export interface ApiError extends Error {
  statusCode: number;
  type: string;
  details?: Record<string, any>;
}

/**
 * Creates a standardized API error
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  type: string;
  details?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS_CODES.SERVER_ERROR,
    type: string = ERROR_TYPES.INTERNAL_SERVER_ERROR,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error for Zod and other validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(
      message,
      HTTP_STATUS_CODES.BAD_REQUEST,
      ERROR_TYPES.VALIDATION_ERROR,
      details
    );
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", details?: Record<string, any>) {
    super(
      message,
      HTTP_STATUS_CODES.UNAUTHORIZED,
      ERROR_TYPES.AUTHENTICATION_ERROR,
      details
    );
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", details?: Record<string, any>) {
    super(
      message,
      HTTP_STATUS_CODES.FORBIDDEN,
      ERROR_TYPES.AUTHORIZATION_ERROR,
      details
    );
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(
      `${resource} not found`,
      HTTP_STATUS_CODES.NOT_FOUND,
      ERROR_TYPES.NOT_FOUND_ERROR
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string) {
    super(
      message,
      HTTP_STATUS_CODES.RATE_LIMIT,
      ERROR_TYPES.RATE_LIMIT_ERROR
    );
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.DATABASE_ERROR
    );
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Redis/Cache error
 */
export class RedisError extends AppError {
  constructor(message: string = "Cache operation failed") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.REDIS_ERROR
    );
    Object.setPrototypeOf(this, RedisError.prototype);
  }
}

/**
 * LLM service error
 */
export class LLMError extends AppError {
  constructor(message: string = "Failed to generate response") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.LLM_ERROR
    );
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

/**
 * Email service error
 */
export class EmailServiceError extends AppError {
  constructor(message: string = "Failed to send email") {
    super(
      message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.EMAIL_SERVICE_ERROR
    );
    Object.setPrototypeOf(this, EmailServiceError.prototype);
  }
}

/**
 * Converts different error types to standardized AppError
 */
export function convertToAppError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    return new ValidationError("Validation failed", fieldErrors as any);
  }

  // Standard Error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      HTTP_STATUS_CODES.SERVER_ERROR,
      ERROR_TYPES.INTERNAL_SERVER_ERROR
    );
  }

  // Unknown error
  return new AppError(
    "An unexpected error occurred",
    HTTP_STATUS_CODES.SERVER_ERROR,
    ERROR_TYPES.INTERNAL_SERVER_ERROR
  );
}

/**
 * Logs error with context
 */
export function logError(
  error: unknown,
  context: string,
  level: "error" | "warn" = "error"
): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${context}]`;

  if (error instanceof AppError) {
    console[level](
      `${prefix} ${error.type}: ${error.message}`,
      error.details || {}
    );
  } else if (error instanceof Error) {
    console[level](`${prefix} ${error.name}: ${error.message}`, error.stack);
  } else {
    console[level](`${prefix}`, error);
  }
}

/**
 * Handles API errors and returns standardized NextResponse
 */
export function handleApiError(
  error: unknown,
  context: string,
  isDevelopment: boolean = process.env.NODE_ENV === "development"
): NextResponse {
  const appError = convertToAppError(error);

  // Log the error
  logError(appError, context);

  const responseBody: any = {
    success: false,
    error: appError.message,
    type: appError.type,
  };

  // Include validation details if present
  if (appError.details) {
    responseBody.details = appError.details;
  }

  // Include stack trace only in development
  if (isDevelopment && appError instanceof Error) {
    responseBody.stack = appError.stack;
  }

  return NextResponse.json(responseBody, {
    status: appError.statusCode,
  });
}

/**
 * Wraps an async API route handler with error handling
 */
export function withErrorHandling<T extends any[], R>(
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
