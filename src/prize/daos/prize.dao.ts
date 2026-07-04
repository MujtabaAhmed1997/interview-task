import { Transaction } from 'sequelize';
import { BaseDAO } from '../../common/base/base.dao';
import { DbSort } from '../../common/enums/db-sort.enum';
import { PrizeDTO } from '../dtos/prize.dto';
import { PrizeModel } from '../models/prize.model';

export class PrizeDAO extends BaseDAO<PrizeModel, PrizeDTO> {
  constructor() {
    super(PrizeModel);
  }

  protected toDTO(entity: PrizeModel): PrizeDTO {
    const dto = new PrizeDTO();
    dto.id = entity.id;
    dto.contestId = entity.contestId;
    dto.rank = entity.rank;
    dto.title = entity.title;
    dto.description = entity.description ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  async findByContest(contestId: string, transaction?: Transaction): Promise<PrizeDTO[]> {
    const rows = await this.model.findAll({ where: { contestId }, order: [['rank', DbSort.ASC]], transaction });
    return rows.map((row) => this.toDTO(row));
  }
}
