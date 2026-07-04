import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { RateLimitPolicy, RateLimitResult, RateLimitStore } from './rate-limit.types';

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly limiters = new Map<string, RateLimiterMemory>();

  async consume(policy: RateLimitPolicy, key: string): Promise<RateLimitResult> {
    const limiter = this.getLimiter(policy);
    try {
      const res = await limiter.consume(key);
      return { allowed: true, limit: policy.points, remaining: res.remainingPoints, resetMs: res.msBeforeNext };
    } catch (error) {
      if (error instanceof RateLimiterRes) {
        return { allowed: false, limit: policy.points, remaining: 0, resetMs: error.msBeforeNext };
      }
      throw error;
    }
  }

  private getLimiter(policy: RateLimitPolicy): RateLimiterMemory {
    const existing = this.limiters.get(policy.name);
    if (existing) {
      return existing;
    }
    const limiter = new RateLimiterMemory({
      keyPrefix: `rl:${policy.name}`,
      points: policy.points,
      duration: policy.durationSec,
      blockDuration: policy.blockSec,
    });
    this.limiters.set(policy.name, limiter);
    return limiter;
  }
}
