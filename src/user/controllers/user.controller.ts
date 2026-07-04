import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError, apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { requireRoles } from '../../common/middlewares/role.middleware';
import { parseListQuery } from '../../common/validators/list-query';
import { listUsersValidator } from '../requests/list-users.request';
import { updateRoleValidator } from '../requests/update-role.request';
import { UserResponse } from '../responses/user.response';
import { UserService } from '../services/user.service';

export class UserController extends RouterClass {
  private readonly userService: UserService;

  constructor(userService: UserService = new UserService()) {
    super();
    this.userService = userService;
  }

  protected register(): void {
    this.router.get('/', authRequired, requireRoles(UserRole.ADMIN), ...listUsersValidator, this.handle(this.list.bind(this)));
    this.router.patch('/:id/role', authRequired, requireRoles(UserRole.ADMIN), ...updateRoleValidator, this.handle(this.updateRole.bind(this)));
  }

  private async list(req: Request, res: Response): Promise<void> {
    const result = await this.userService.list(parseListQuery(req));
    apiOk(res, { data: result.data.map((user) => new UserResponse(user)), metadata: result.metadata });
  }

  private async updateRole(req: Request, res: Response): Promise<void> {
    const actor = req.user;
    if (!actor) {
      throw ApiError.unauthorized();
    }
    const updated = await this.userService.updateRole(req.params.id, req.body.role, actor.id);
    apiOk(res, new UserResponse(updated));
  }
}
