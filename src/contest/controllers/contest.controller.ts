import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { HttpStatusCode } from '../../common/enums/http-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError, apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { requireRoles } from '../../common/middlewares/role.middleware';
import { parseListQuery } from '../../common/validators/list-query';
import { contestIdValidator } from '../requests/contest-id.request';
import { createContestValidator } from '../requests/create-contest.request';
import { CONTEST_DEFAULT_SORT, listContestsValidator, parseContestFilters } from '../requests/list-contest.request';
import { updateContestValidator } from '../requests/update-contest.request';
import { ContestResponse } from '../responses/contest.response';
import { ContestService } from '../services/contest.service';

export class ContestController extends RouterClass {
  private readonly contestService: ContestService;

  constructor(contestService: ContestService = new ContestService()) {
    super();
    this.contestService = contestService;
  }

  protected register(): void {
    this.router.get('/', ...listContestsValidator, this.handle(this.list.bind(this)));
    this.router.get('/:id', ...contestIdValidator, this.handle(this.getById.bind(this)));
    this.router.post('/', authRequired, requireRoles(UserRole.ADMIN), ...createContestValidator, this.handle(this.create.bind(this)));
    this.router.put('/:id', authRequired, requireRoles(UserRole.ADMIN), ...updateContestValidator, this.handle(this.update.bind(this)));
    this.router.delete('/:id', authRequired, requireRoles(UserRole.ADMIN), ...contestIdValidator, this.handle(this.remove.bind(this)));
  }

  private async list(req: Request, res: Response): Promise<void> {
    const result = await this.contestService.listContests(parseListQuery(req, CONTEST_DEFAULT_SORT), parseContestFilters(req));
    apiOk(res, { data: result.data.map((contest) => new ContestResponse(contest)), metadata: result.metadata });
  }

  private async getById(req: Request, res: Response): Promise<void> {
    const contest = await this.contestService.getById(req.params.id);
    apiOk(res, new ContestResponse(contest));
  }

  private async create(req: Request, res: Response): Promise<void> {
    const actor = req.user;
    if (!actor) {
      throw ApiError.unauthorized();
    }
    const contest = await this.contestService.create(
      { name: req.body.name, description: req.body.description, accessLevel: req.body.accessLevel, startTime: req.body.startTime, endTime: req.body.endTime },
      actor.id,
    );
    apiOk(res, new ContestResponse(contest), HttpStatusCode.CREATED);
  }

  private async update(req: Request, res: Response): Promise<void> {
    const contest = await this.contestService.update(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      accessLevel: req.body.accessLevel,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });
    apiOk(res, new ContestResponse(contest));
  }

  private async remove(req: Request, res: Response): Promise<void> {
    await this.contestService.remove(req.params.id);
    apiOk(res, {});
  }
}
