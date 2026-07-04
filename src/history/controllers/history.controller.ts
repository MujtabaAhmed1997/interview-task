import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { ApiError, apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { AuthUser } from '../../common/types/auth-user';
import { listQueryValidators, parseListQuery } from '../../common/validators/list-query';
import { UserPrizeResponse } from '../../prize/responses/user-prize.response';
import { historyContestsValidator, parseHistoryStatus } from '../requests/history-contests-query.request';
import { ContestHistoryResponse } from '../responses/contest-history.response';
import { HistoryService } from '../services/history.service';

export class HistoryController extends RouterClass {
  private readonly historyService: HistoryService;

  constructor(historyService: HistoryService = new HistoryService()) {
    super();
    this.historyService = historyService;
  }

  protected register(): void {
    this.router.get('/me/contests', authRequired, ...historyContestsValidator, this.handle(this.contests.bind(this)));
    this.router.get('/me/prizes', authRequired, ...listQueryValidators(), this.handle(this.prizes.bind(this)));
  }

  private actor(req: Request): AuthUser {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    return req.user;
  }

  private async contests(req: Request, res: Response): Promise<void> {
    const result = await this.historyService.listContests(this.actor(req).id, parseListQuery(req), parseHistoryStatus(req));
    apiOk(res, { data: result.data.map((participation) => new ContestHistoryResponse(participation)), metadata: result.metadata });
  }

  private async prizes(req: Request, res: Response): Promise<void> {
    const result = await this.historyService.listPrizes(this.actor(req).id, parseListQuery(req));
    apiOk(res, { data: result.data.map((award) => new UserPrizeResponse(award)), metadata: result.metadata });
  }
}
