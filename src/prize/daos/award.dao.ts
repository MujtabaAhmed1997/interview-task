import { CreationAttributes, Transaction } from 'sequelize';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, MAX_PER_PAGE, PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { DbSort } from '../../common/enums/db-sort.enum';
import { ContestModel } from '../../contest/models/contest.model';
import { AwardModel } from '../models/award.model';
import { PrizeModel } from '../models/prize.model';
import { UserAwardView } from '../types/user-award-view';

export class AwardDAO {
  async existsForContest(contestId: string, transaction?: Transaction): Promise<boolean> {
    const count = await AwardModel.count({ where: { contestId }, transaction });
    return count > 0;
  }

  async createMany(rows: CreationAttributes<AwardModel>[], transaction?: Transaction): Promise<void> {
    if (rows.length > 0) {
      await AwardModel.bulkCreate(rows, { transaction });
    }
  }

  async findByUser(params: PaginationParams, userId: string): Promise<PaginatedResult<UserAwardView>> {
    const page = params.page < 1 ? DEFAULT_PAGE : params.page;
    const perPage = Math.min(params.perPage < 1 ? DEFAULT_PER_PAGE : params.perPage, MAX_PER_PAGE);
    const { rows, count } = await AwardModel.findAndCountAll({
      where: { userId },
      include: [
        { model: PrizeModel, as: 'prize', attributes: ['title', 'rank'] },
        { model: ContestModel, as: 'contest', attributes: ['name'] },
      ],
      order: [['awardedAt', DbSort.DESC]],
      limit: perPage,
      offset: perPage * (page - 1),
    });
    const lastPage = Math.max(1, Math.ceil(count / perPage));
    return {
      data: rows.map((row) => ({
        contestId: row.contestId,
        contestName: row.contest?.name ?? '',
        prizeId: row.prizeId,
        prizeTitle: row.prize?.title ?? '',
        rank: row.prize?.rank ?? 0,
        score: row.score,
        awardedAt: row.awardedAt,
      })),
      metadata: { total: count, page, perPage, lastPage, hasNext: page < lastPage, hasPrevious: page > 1 },
    };
  }
}
