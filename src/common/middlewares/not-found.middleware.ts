import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/api.error';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
