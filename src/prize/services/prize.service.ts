import { UniqueConstraintError } from 'sequelize';
import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { CacheService, cacheService } from '../../common/cache/cache.service';
import { sequelize } from '../../common/config/database';
import { CacheKeyPrefix } from '../../common/enums/cache-key.enum';
import { QueueName } from '../../common/enums/queue-name.enum';
import { ApiError } from '../../common/errors/api.error';
import { getQueue } from '../../common/queues/queue.registry';
import { ContestService } from '../../contest/services/contest.service';
import { ParticipationService } from '../../participation/services/participation.service';
import { AwardDAO } from '../daos/award.dao';
import { PrizeDAO } from '../daos/prize.dao';
import { PrizeDTO } from '../dtos/prize.dto';
import { PrizeErrorCode } from '../enums/prize-error-code.enum';
import { CreatePrizeInput } from '../requests/create-prize.request';
import { AwardJobData } from '../types/award-job';
import { UserAwardView } from '../types/user-award-view';

export class PrizeService {
  private readonly awardDao = new AwardDAO();
  private readonly dao: PrizeDAO;
  private readonly contestService: ContestService;
  private readonly participationService: ParticipationService;
  private readonly cache: CacheService;

  constructor(
    dao: PrizeDAO = new PrizeDAO(),
    contestService: ContestService = new ContestService(),
    participationService: ParticipationService = new ParticipationService(),
    cache: CacheService = cacheService,
  ) {
    this.dao = dao;
    this.contestService = contestService;
    this.participationService = participationService;
    this.cache = cache;
  }

  async createPrize(contestId: string, input: CreatePrizeInput): Promise<PrizeDTO> {
    const contest = await this.contestService.getById(contestId);
    try {
      const prize = await this.dao.create({ contestId, rank: input.rank ?? 1, title: input.title, description: input.description ?? null });
      await this.scheduleAward(contestId, contest.endTime);
      return prize;
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw ApiError.conflict('A prize already exists for this rank', PrizeErrorCode.DUPLICATE_RANK);
      }
      throw error;
    }
  }

  async listByContest(contestId: string): Promise<PrizeDTO[]> {
    await this.contestService.getById(contestId);
    return this.dao.findByContest(contestId);
  }

  async removePrize(prizeId: string): Promise<void> {
    const prize = await this.dao.findByIdOrNull(prizeId);
    if (!prize) {
      throw ApiError.notFound('Prize not found', PrizeErrorCode.PRIZE_NOT_FOUND);
    }
    await this.dao.remove(prizeId);
  }

  async listUserPrizes(userId: string, params: PaginationParams): Promise<PaginatedResult<UserAwardView>> {
    return this.awardDao.findByUser(params, userId);
  }

  async scheduleAward(contestId: string, endTime: Date): Promise<void> {
    const delay = Math.max(0, new Date(endTime).getTime() - Date.now());
    await getQueue(QueueName.PRIZE_AWARD).add(QueueName.PRIZE_AWARD, { contestId } satisfies AwardJobData, { delay, jobId: `award-${contestId}` });
  }

  async runAward(contestId: string): Promise<void> {
    const prizes = await this.dao.findByContest(contestId);
    if (prizes.length === 0) {
      return;
    }
    const created = await sequelize.transaction(async (transaction) => {
      if (await this.awardDao.existsForContest(contestId, transaction)) {
        return false;
      }
      const winners = await this.participationService.getTopSubmitted(contestId, prizes.length, transaction);
      const awardedAt = new Date();
      const rows = winners.map((winner, index) => ({ contestId, userId: winner.userId, prizeId: prizes[index].id, score: winner.score, awardedAt }));
      await this.awardDao.createMany(rows, transaction);
      return rows.length > 0;
    });
    if (created) {
      await this.cache.delByPrefix(`${CacheKeyPrefix.CONTEST_LEADERBOARD}:${contestId}`);
    }
  }
}
