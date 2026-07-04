import { RateScope } from '../enums/rate-scope.enum';

export interface RateLimitPolicy {
  name: string;
  scope: RateScope;
  points: number;
  durationSec: number;
  blockSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface RateLimitStore {
  consume(policy: RateLimitPolicy, key: string): Promise<RateLimitResult>;
}
