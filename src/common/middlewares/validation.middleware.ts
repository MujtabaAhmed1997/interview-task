import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { ApiErrorCode } from '../enums/api-error-code.enum';
import { CommonErrorCode } from '../enums/common-error-code.enum';
import { ApiError, ApiErrorDetail } from '../errors/api.error';

const runValidation = (req: Request, _res: Response, next: NextFunction): void => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }
  const details: ApiErrorDetail[] = result.array().map((error) => ({
    code: ApiErrorCode.VALIDATION,
    subCode: CommonErrorCode.VALIDATION_FAILED,
    message: String(error.msg),
    field: error.type === 'field' ? error.path : undefined,
  }));
  next(ApiError.badRequest('Validation failed', CommonErrorCode.VALIDATION_FAILED, details));
};

export const validate = (chains: ValidationChain[]): Array<ValidationChain | RequestHandler> => [...chains, runValidation];
