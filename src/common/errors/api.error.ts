import { Response } from 'express';
import { ApiErrorCode } from '../enums/api-error-code.enum';
import { HttpStatusCode } from '../enums/http-status.enum';
import { isProduction } from '../util/secrets';

export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  field?: string;
}

export interface ApiEnvelope<T> {
  result: T | null;
  errors: ApiErrorDetail[];
  stack?: string;
}

export class ApiError extends Error {
  public readonly status: HttpStatusCode;
  public readonly errors: ApiErrorDetail[];

  constructor(status: HttpStatusCode, code: ApiErrorCode, message: string, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors ?? [{ code, message }];
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: ApiErrorDetail[]): ApiError {
    return new ApiError(HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, message, errors);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(HttpStatusCode.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED, message);
  }

  static forbidden(message = 'You do not have access to this resource'): ApiError {
    return new ApiError(HttpStatusCode.FORBIDDEN, ApiErrorCode.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(HttpStatusCode.NOT_FOUND, ApiErrorCode.NOT_FOUND, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HttpStatusCode.CONFLICT, ApiErrorCode.CONFLICT, message);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(HttpStatusCode.TOO_MANY_REQUESTS, ApiErrorCode.RATE_LIMIT_EXCEEDED, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, ApiErrorCode.INTERNAL, message);
  }
}

export const apiOk = <T>(res: Response, result: T, status: HttpStatusCode = HttpStatusCode.OK): Response => {
  const body: ApiEnvelope<T> = { result, errors: [] };
  return res.status(status).json(body);
};

export const apiError = (res: Response, error: unknown): Response => {
  const known = error instanceof ApiError ? error : ApiError.internal();
  const body: ApiEnvelope<null> = { result: null, errors: known.errors };
  if (!isProduction() && error instanceof Error) {
    body.stack = error.stack;
  }
  return res.status(known.status).json(body);
};
