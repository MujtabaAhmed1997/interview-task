import { BaseDAO } from '../../common/base/base.dao';
import { ContestDTO } from '../dtos/contest.dto';
import { ContestModel } from '../models/contest.model';

export class ContestDAO extends BaseDAO<ContestModel, ContestDTO> {
  constructor() {
    super(ContestModel);
  }

  protected toDTO(entity: ContestModel): ContestDTO {
    const dto = new ContestDTO();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description ?? null;
    dto.accessLevel = entity.accessLevel;
    dto.startTime = entity.startTime;
    dto.endTime = entity.endTime;
    dto.createdBy = entity.createdBy;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
