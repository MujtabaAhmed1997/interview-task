import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { UserRole } from '../../common/enums/user-role.enum';
import { apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { requireRoles } from '../../common/middlewares/role.middleware';
import { updatePolicyValidator } from '../requests/update-policy.request';
import { RateLimitPolicyResponse } from '../responses/rate-limit-policy.response';
import { RateLimitPolicyAdminService } from '../services/rate-limit-policy-admin.service';

export class RateLimitPolicyController extends RouterClass {
  private readonly policyService: RateLimitPolicyAdminService;

  constructor(policyService: RateLimitPolicyAdminService = new RateLimitPolicyAdminService()) {
    super();
    this.policyService = policyService;
  }

  protected register(): void {
    this.router.get('/admin/rate-limit-policies', authRequired, requireRoles(UserRole.ADMIN), this.handle(this.list.bind(this)));
    this.router.patch('/admin/rate-limit-policies/:name', authRequired, requireRoles(UserRole.ADMIN), ...updatePolicyValidator, this.handle(this.update.bind(this)));
  }

  private async list(_req: Request, res: Response): Promise<void> {
    const policies = await this.policyService.list();
    apiOk(
      res,
      policies.map((policy) => new RateLimitPolicyResponse(policy)),
    );
  }

  private async update(req: Request, res: Response): Promise<void> {
    const policy = await this.policyService.update(req.params.name, {
      points: req.body.points,
      durationSec: req.body.durationSec,
      blockSec: req.body.blockSec,
      enabled: req.body.enabled,
    });
    apiOk(res, new RateLimitPolicyResponse(policy));
  }
}
