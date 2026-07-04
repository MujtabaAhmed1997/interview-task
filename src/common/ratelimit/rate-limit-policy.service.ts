import { RateLimitPolicyName } from '../enums/rate-limit-policy-name.enum';
import { RateScope } from '../enums/rate-scope.enum';
import { ApiError } from '../errors/api.error';
import { RateLimitPolicy } from './rate-limit.types';

const DEFAULT_POLICIES: RateLimitPolicy[] = [
  { name: RateLimitPolicyName.GLOBAL, scope: RateScope.IP, points: 100, durationSec: 60, blockSec: 60 },
  { name: RateLimitPolicyName.AUTH_LOGIN, scope: RateScope.IP, points: 10, durationSec: 60, blockSec: 300 },
  { name: RateLimitPolicyName.CONTEST_SUBMIT, scope: RateScope.USER, points: 5, durationSec: 60, blockSec: 60 },
  { name: RateLimitPolicyName.CONTEST_JOIN, scope: RateScope.USER, points: 20, durationSec: 60, blockSec: 60 },
];

export class RateLimitPolicyService {
  private readonly policies = new Map<string, RateLimitPolicy>();

  constructor() {
    this.loadDefaults();
  }

  get(name: string): RateLimitPolicy {
    const policy = this.policies.get(name);
    if (!policy) {
      throw ApiError.internal(`Rate limit policy not found: ${name}`);
    }
    return policy;
  }

  upsert(policy: RateLimitPolicy): void {
    this.policies.set(policy.name, policy);
  }

  private loadDefaults(): void {
    DEFAULT_POLICIES.forEach((policy) => this.policies.set(policy.name, policy));
  }
}

export const rateLimitPolicyService = new RateLimitPolicyService();
