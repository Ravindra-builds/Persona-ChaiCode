// ==============================
// Rate Limiting
// ==============================

export const RATE_LIMITS = {
  CHAT: {
    limit: 12,
    message:
      "You've reached your daily limit of 12 messages. Come back tomorrow to continue learning!",
  },
} as const;

// ==============================
// HTTP Status Codes
// ==============================

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ==============================
// Error Types
// ==============================

export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  REDIS_ERROR: "REDIS_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  LLM_ERROR: "LLM_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;