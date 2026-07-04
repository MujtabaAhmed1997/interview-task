import { BaseDAO } from '../../common/base/base.dao';
import { ParticipationDTO } from '../dtos/participation.dto';
import { ParticipationModel } from '../models/participation.model';

export class ParticipationDAO extends BaseDAO<ParticipationModel, ParticipationDTO> {
  constructor() {
    super(ParticipationModel);
  }

  protected toDTO(entity: ParticipationModel): ParticipationDTO {
    const dto = new ParticipationDTO();
    dto.id = entity.id;
    dto.contestId = entity.contestId;
    dto.userId = entity.userId;
    dto.status = entity.status;
    dto.score = entity.score ?? null;
    dto.startedAt = entity.startedAt;
    dto.submittedAt = entity.submittedAt ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  async findByContestAndUser(contestId: string, userId: string): Promise<ParticipationDTO | null> {
    const entity = await this.model.findOne({ where: { contestId, userId } });
    return entity ? this.toDTO(entity) : null;
  }
}
