import { RateScope } from '../../common/enums/rate-scope.enum';
import { RateLimitPolicyDTO } from '../dtos/rate-limit-policy.dto';

export class RateLimitPolicyResponse {
  id: string;
  name: string;
  scope: RateScope;
  points: number;
  durationSec: number;
  blockSec: number;
  enabled: boolean;

  constructor(dto: RateLimitPolicyDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.scope = dto.scope;
    this.points = dto.points;
    this.durationSec = dto.durationSec;
    this.blockSec = dto.blockSec;
    this.enabled = dto.enabled;
  }
}
