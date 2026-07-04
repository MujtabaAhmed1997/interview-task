import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { DbSort } from '../../common/enums/db-sort.enum';
import { apiOk } from '../../common/errors/api.error';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';
import { listQueryValidators, parseListQuery } from '../../common/validators/list-query';
import { LeaderboardEntryResponse } from '../responses/leaderboard-entry.response';
import { LeaderboardService } from '../services/leaderboard.service';

const LEADERBOARD_SORT = 'score';

export class LeaderboardController extends RouterClass {
  private readonly leaderboardService: LeaderboardService;

  constructor(leaderboardService: LeaderboardService = new LeaderboardService()) {
    super();
    this.leaderboardService = leaderboardService;
  }

  protected register(): void {
    this.router.get('/contests/:id/leaderboard', ...validate([idParam(), ...listQueryValidators()]), this.handle(this.leaderboard.bind(this)));
  }

  private async leaderboard(req: Request, res: Response): Promise<void> {
    const params = parseListQuery(req, LEADERBOARD_SORT);
    params.sort = { [LEADERBOARD_SORT]: DbSort.DESC };
    const result = await this.leaderboardService.getLeaderboard(req.params.id, params);
    apiOk(res, { data: result.data.map((entry) => new LeaderboardEntryResponse(entry)), metadata: result.metadata });
  }
}
