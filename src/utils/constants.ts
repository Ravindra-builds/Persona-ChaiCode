// Rate limiting constants
export const RATE_LIMITS = {
  //messages: 12 messages per 24 hours
  CHAT: {
    limit: 12,
    window: 24 * 60 * 60, // 24 hours in seconds
    message: "Ok that's my time,you have reached your daily quota. we can talk tomorrow again .",
  },
  // Login attempts: 6 attempts per hour
  LOGIN: {
    limit: 6,
    window: 60 * 60, 
    message: "Too many login attempts. Please try again in 1 hour.",
  },
  // OTP verification: 5 attempts per 15 minutes
  OTP: {
    limit: 5,
    window: 15 * 60,
    message: "Too many OTP verification attempts. Please try again later.",
  },
  // Register: 3 attempts per hour
  REGISTER: {
    limit: 3,
    window: 60 * 60, 
    message: "Too many registration attempts. Please try again in 1 hour.",
  },
  // Refresh token: 10 attempts per 5 minutes
  REFRESH_TOKEN: {
    limit: 10,
    window: 5 * 60, 
    message: "Too many token refresh attempts. Please try again later.",
  },
};

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
};

export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR",
  REDIS_ERROR: "REDIS_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EMAIL_SERVICE_ERROR: "EMAIL_SERVICE_ERROR",
  LLM_ERROR: "LLM_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};
