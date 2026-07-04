import { Request, RequestHandler } from 'express';
import { CommonErrorCode } from '../enums/common-error-code.enum';
import { RateScope } from '../enums/rate-scope.enum';
import { ApiError } from '../errors/api.error';
import { catchAsync } from '../util/catch.async';
import { rateLimitPolicyService } from './rate-limit-policy.service';
import { getRateLimitStore } from './rate-limit-store.factory';
import { RateLimitPolicy } from './rate-limit.types';

const buildKey = (policy: RateLimitPolicy, req: Request): string => {
  if (policy.scope === RateScope.USER && req.user) {
    return `user:${req.user.id}`;
  }
  return `ip:${req.ip ?? 'unknown'}`;
};

export const rateLimit = (policyName: string): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const policy = rateLimitPolicyService.get(policyName);
    const result = await getRateLimitStore().consume(policy, buildKey(policy, req));
    res.setHeader('RateLimit-Limit', result.limit);
    res.setHeader('RateLimit-Remaining', Math.max(0, result.remaining));
    res.setHeader('RateLimit-Reset', Math.ceil(result.resetMs / 1000));
    if (!result.allowed) {
      throw ApiError.tooManyRequests('Rate limit exceeded', CommonErrorCode.RATE_LIMIT_EXCEEDED);
    }
    next();
  });
