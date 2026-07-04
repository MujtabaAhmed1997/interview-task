import { Transaction } from 'sequelize';
import { BaseDAO } from '../../common/base/base.dao';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, MAX_PER_PAGE, PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { DbSort } from '../../common/enums/db-sort.enum';
import { UserModel } from '../../user/models/user.model';
import { ParticipationDTO } from '../dtos/participation.dto';
import { ParticipationStatus } from '../enums/participation-status.enum';
import { ParticipationModel } from '../models/participation.model';
import { RankedParticipation, TopParticipation } from '../types/ranked-participation';

const RANKED_ORDER: [string, DbSort][] = [
  ['score', DbSort.DESC],
  ['submittedAt', DbSort.ASC],
];

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

  async findByUser(params: PaginationParams, userId: string, status?: ParticipationStatus): Promise<PaginatedResult<ParticipationDTO>> {
    return this.paginate(params, status ? { userId, status } : { userId });
  }

  async getRankedSubmitted(contestId: string, params: PaginationParams): Promise<PaginatedResult<RankedParticipation>> {
    const page = params.page < 1 ? DEFAULT_PAGE : params.page;
    const perPage = Math.min(params.perPage < 1 ? DEFAULT_PER_PAGE : params.perPage, MAX_PER_PAGE);
    const { rows, count } = await this.model.findAndCountAll({
      where: { contestId, status: ParticipationStatus.SUBMITTED },
      include: [{ model: UserModel, as: 'user', attributes: ['name'] }],
      order: RANKED_ORDER,
      limit: perPage,
      offset: perPage * (page - 1),
    });
    const lastPage = Math.max(1, Math.ceil(count / perPage));
    return {
      data: rows.map((row) => ({ userId: row.userId, userName: row.user?.name ?? '', score: row.score ?? 0, submittedAt: row.submittedAt as Date })),
      metadata: { total: count, page, perPage, lastPage, hasNext: page < lastPage, hasPrevious: page > 1 },
    };
  }

  async getTopSubmitted(contestId: string, limit: number, transaction?: Transaction): Promise<TopParticipation[]> {
    const rows = await this.model.findAll({
      where: { contestId, status: ParticipationStatus.SUBMITTED },
      order: RANKED_ORDER,
      limit,
      transaction,
    });
    return rows.map((row) => ({ participationId: row.id, userId: row.userId, score: row.score ?? 0, submittedAt: row.submittedAt as Date }));
  }
}
