import { BaseDAO } from '../../common/base/base.dao';
import { DbSort } from '../../common/enums/db-sort.enum';
import { RateLimitPolicyDTO } from '../dtos/rate-limit-policy.dto';
import { RateLimitPolicyModel } from '../models/rate-limit-policy.model';

export class RateLimitPolicyDAO extends BaseDAO<RateLimitPolicyModel, RateLimitPolicyDTO> {
  constructor() {
    super(RateLimitPolicyModel);
  }

  protected toDTO(entity: RateLimitPolicyModel): RateLimitPolicyDTO {
    const dto = new RateLimitPolicyDTO();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.scope = entity.scope;
    dto.points = entity.points;
    dto.durationSec = entity.durationSec;
    dto.blockSec = entity.blockSec;
    dto.enabled = entity.enabled;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  async findAll(): Promise<RateLimitPolicyDTO[]> {
    const rows = await this.model.findAll({ order: [['name', DbSort.ASC]] });
    return rows.map((row) => this.toDTO(row));
  }

  async findEnabled(): Promise<RateLimitPolicyDTO[]> {
    const rows = await this.model.findAll({ where: { enabled: true } });
    return rows.map((row) => this.toDTO(row));
  }

  async findByName(name: string): Promise<RateLimitPolicyDTO | null> {
    const entity = await this.model.findOne({ where: { name } });
    return entity ? this.toDTO(entity) : null;
  }
}
