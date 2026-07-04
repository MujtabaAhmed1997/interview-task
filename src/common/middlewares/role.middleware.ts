import { NextFunction, Request, RequestHandler, Response } from 'express';
import { CommonErrorCode } from '../enums/common-error-code.enum';
import { UserRole } from '../enums/user-role.enum';
import { ApiError } from '../errors/api.error';

export const requireRoles =
  (...roles: UserRole[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required', CommonErrorCode.UNAUTHENTICATED));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have access to this resource', CommonErrorCode.FORBIDDEN));
      return;
    }
    next();
  };
