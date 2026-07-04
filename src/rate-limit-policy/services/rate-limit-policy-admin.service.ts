import { ApiError } from '../../common/errors/api.error';
import { RateLimitPolicyService, rateLimitPolicyService } from '../../common/ratelimit/rate-limit-policy.service';
import { RateLimitPolicy } from '../../common/ratelimit/rate-limit.types';
import { logger } from '../../common/util/logger';
import { RateLimitPolicyDAO } from '../daos/rate-limit-policy.dao';
import { RateLimitPolicyDTO } from '../dtos/rate-limit-policy.dto';
import { RateLimitPolicyErrorCode } from '../enums/rate-limit-policy-error-code.enum';
import { UpdatePolicyInput } from '../requests/update-policy.request';

const toRuntimePolicy = (dto: RateLimitPolicyDTO): RateLimitPolicy => ({
  name: dto.name,
  scope: dto.scope,
  points: dto.points,
  durationSec: dto.durationSec,
  blockSec: dto.blockSec,
});

export class RateLimitPolicyAdminService {
  private readonly dao: RateLimitPolicyDAO;
  private readonly runtime: RateLimitPolicyService;

  constructor(dao: RateLimitPolicyDAO = new RateLimitPolicyDAO(), runtime: RateLimitPolicyService = rateLimitPolicyService) {
    this.dao = dao;
    this.runtime = runtime;
  }

  async loadIntoRuntime(): Promise<void> {
    try {
      const policies = await this.dao.findEnabled();
      policies.forEach((policy) => this.runtime.upsert(toRuntimePolicy(policy)));
      logger.info({ event: 'ratelimit.policies.loaded', count: policies.length });
    } catch (error) {
      logger.error({ event: 'ratelimit.policies.load_failed', message: error instanceof Error ? error.message : 'unknown' });
    }
  }

  async list(): Promise<RateLimitPolicyDTO[]> {
    return this.dao.findAll();
  }

  async update(name: string, input: UpdatePolicyInput): Promise<RateLimitPolicyDTO> {
    const existing = await this.dao.findByName(name);
    if (!existing) {
      throw ApiError.notFound('Rate limit policy not found', RateLimitPolicyErrorCode.POLICY_NOT_FOUND);
    }
    const updated = await this.dao.update(existing.id, this.toPayload(input));
    if (updated.enabled) {
      this.runtime.upsert(toRuntimePolicy(updated));
    }
    return updated;
  }

  private toPayload(input: UpdatePolicyInput): Partial<RateLimitPolicyDTO> {
    const payload: Partial<RateLimitPolicyDTO> = {};
    if (input.points !== undefined) {
      payload.points = input.points;
    }
    if (input.durationSec !== undefined) {
      payload.durationSec = input.durationSec;
    }
    if (input.blockSec !== undefined) {
      payload.blockSec = input.blockSec;
    }
    if (input.enabled !== undefined) {
      payload.enabled = input.enabled;
    }
    return payload;
  }
}

export const rateLimitPolicyAdminService = new RateLimitPolicyAdminService();
