import { NextFunction, Request, Response } from 'express';
import { ApiError, apiError } from '../errors/api.error';
import { logger } from '../util/logger';

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (!(error instanceof ApiError)) {
    logger.error({
      event: 'request.unhandled_error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
  apiError(res, error);
};
