import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { CacheService, cacheService } from '../../common/cache/cache.service';
import { CacheKeyPrefix } from '../../common/enums/cache-key.enum';
import { ContestService } from '../../contest/services/contest.service';
import { ParticipationService } from '../../participation/services/participation.service';
import { LeaderboardEntry } from '../types/leaderboard-entry';

export class LeaderboardService {
  private readonly contestService: ContestService;
  private readonly participationService: ParticipationService;
  private readonly cache: CacheService;

  constructor(contestService: ContestService = new ContestService(), participationService: ParticipationService = new ParticipationService(), cache: CacheService = cacheService) {
    this.contestService = contestService;
    this.participationService = participationService;
    this.cache = cache;
  }

  async getLeaderboard(contestId: string, params: PaginationParams): Promise<PaginatedResult<LeaderboardEntry>> {
    await this.contestService.getById(contestId);
    const key = `${CacheKeyPrefix.CONTEST_LEADERBOARD}:${contestId}:${params.page}:${params.perPage}`;
    const cached = await this.cache.get<PaginatedResult<LeaderboardEntry>>(key);
    if (cached) {
      return cached;
    }
    const ranked = await this.participationService.getRankedSubmitted(contestId, params);
    const offset = (ranked.metadata.page - 1) * ranked.metadata.perPage;
    const result: PaginatedResult<LeaderboardEntry> = {
      data: ranked.data.map((entry, index) => ({ ...entry, rank: offset + index + 1 })),
      metadata: ranked.metadata,
    };
    await this.cache.set(key, result);
    return result;
  }
}
