import { DTO } from '../../common/base/dto';
import { RateScope } from '../../common/enums/rate-scope.enum';

export class RateLimitPolicyDTO extends DTO {
  name!: string;
  scope!: RateScope;
  points!: number;
  durationSec!: number;
  blockSec!: number;
  enabled!: boolean;
}
