import { Response } from 'express';
import { ApiErrorCode } from '../enums/api-error-code.enum';
import { CommonErrorCode } from '../enums/common-error-code.enum';
import { HttpStatusCode } from '../enums/http-status.enum';
import { isDevelopment } from '../util/secrets';

export interface ApiErrorDetail {
  code: ApiErrorCode;
  subCode: string;
  message: string;
  field?: string;
}

export interface ApiEnvelope<T> {
  result: T | null;
  errors: ApiErrorDetail[] | null;
  stack?: string;
}

export class ApiError extends Error {
  public readonly status: HttpStatusCode;
  public readonly code: ApiErrorCode;
  public readonly subCode: string;
  public readonly errors: ApiErrorDetail[];

  constructor(status: HttpStatusCode, code: ApiErrorCode, subCode: string, message: string, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.subCode = subCode;
    this.errors = errors ?? [{ code, subCode, message }];
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, subCode: string = CommonErrorCode.VALIDATION_FAILED, errors?: ApiErrorDetail[]): ApiError {
    return new ApiError(HttpStatusCode.BAD_REQUEST, ApiErrorCode.VALIDATION, subCode, message, errors);
  }

  static unauthorized(message = 'Authentication required', subCode: string = CommonErrorCode.UNAUTHENTICATED): ApiError {
    return new ApiError(HttpStatusCode.UNAUTHORIZED, ApiErrorCode.UNAUTHORIZED, subCode, message);
  }

  static forbidden(message = 'You do not have access to this resource', subCode: string = CommonErrorCode.FORBIDDEN): ApiError {
    return new ApiError(HttpStatusCode.FORBIDDEN, ApiErrorCode.FORBIDDEN, subCode, message);
  }

  static notFound(message = 'Resource not found', subCode: string = CommonErrorCode.RESOURCE_NOT_FOUND): ApiError {
    return new ApiError(HttpStatusCode.NOT_FOUND, ApiErrorCode.NOT_FOUND, subCode, message);
  }

  static conflict(message: string, subCode: string = CommonErrorCode.RESOURCE_CONFLICT): ApiError {
    return new ApiError(HttpStatusCode.CONFLICT, ApiErrorCode.CONFLICT, subCode, message);
  }

  static tooManyRequests(message = 'Too many requests', subCode: string = CommonErrorCode.RATE_LIMIT_EXCEEDED): ApiError {
    return new ApiError(HttpStatusCode.TOO_MANY_REQUESTS, ApiErrorCode.RATE_LIMIT_EXCEEDED, subCode, message);
  }

  static internal(message = 'Internal server error', subCode: string = CommonErrorCode.INTERNAL_ERROR): ApiError {
    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, ApiErrorCode.INTERNAL, subCode, message);
  }
}

export const apiOk = <T>(res: Response, result: T, status: HttpStatusCode = HttpStatusCode.OK): Response => {
  const body: ApiEnvelope<T> = { result, errors: null };
  return res.status(status).json(body);
};

export const apiError = (res: Response, error: unknown): Response => {
  const known = error instanceof ApiError ? error : ApiError.internal();
  const body: ApiEnvelope<null> = { result: null, errors: known.errors };
  if (isDevelopment() && error instanceof Error) {
    body.stack = error.stack;
  }
  return res.status(known.status).json(body);
};
