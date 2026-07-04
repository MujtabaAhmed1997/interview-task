import { NextFunction, Request, Response } from 'express';
import { CommonErrorCode } from '../enums/common-error-code.enum';
import { ApiError } from '../errors/api.error';
import { AuthUser } from '../types/auth-user';
import { verifyToken } from '../util/jwt';

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
};

const toAuthUser = (token: string): AuthUser => {
  const payload = verifyToken(token);
  return { id: payload.sub, email: payload.email, role: payload.role };
};

export const authRequired = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    next(ApiError.unauthorized('Authentication required', CommonErrorCode.UNAUTHENTICATED));
    return;
  }
  try {
    req.user = toAuthUser(token);
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token', CommonErrorCode.UNAUTHENTICATED));
  }
};

export const authOptional = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = toAuthUser(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
};
