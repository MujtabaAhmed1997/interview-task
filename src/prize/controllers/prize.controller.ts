import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { HttpStatusCode } from '../../common/enums/http-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { requireRoles } from '../../common/middlewares/role.middleware';
import { contestIdValidator } from '../../contest/requests/contest-id.request';
import { createPrizeValidator } from '../requests/create-prize.request';
import { prizeIdValidator } from '../requests/prize-id.request';
import { PrizeResponse } from '../responses/prize.response';
import { PrizeService } from '../services/prize.service';

export class PrizeController extends RouterClass {
  private readonly prizeService: PrizeService;

  constructor(prizeService: PrizeService = new PrizeService()) {
    super();
    this.prizeService = prizeService;
  }

  protected register(): void {
    this.router.get('/contests/:id/prizes', ...contestIdValidator, this.handle(this.list.bind(this)));
    this.router.post('/contests/:id/prizes', authRequired, requireRoles(UserRole.ADMIN), ...createPrizeValidator, this.handle(this.create.bind(this)));
    this.router.delete('/prizes/:id', authRequired, requireRoles(UserRole.ADMIN), ...prizeIdValidator, this.handle(this.remove.bind(this)));
  }

  private async list(req: Request, res: Response): Promise<void> {
    const prizes = await this.prizeService.listByContest(req.params.id);
    apiOk(
      res,
      prizes.map((prize) => new PrizeResponse(prize)),
    );
  }

  private async create(req: Request, res: Response): Promise<void> {
    const prize = await this.prizeService.createPrize(req.params.id, { rank: req.body.rank, title: req.body.title, description: req.body.description });
    apiOk(res, new PrizeResponse(prize), HttpStatusCode.CREATED);
  }

  private async remove(req: Request, res: Response): Promise<void> {
    await this.prizeService.removePrize(req.params.id);
    apiOk(res, {});
  }
}
