import { Request, Response } from 'express';
import { RouterClass } from '../../common/base/router.class';
import { HttpStatusCode } from '../../common/enums/http-status.enum';
import { ApiError, apiOk } from '../../common/errors/api.error';
import { authRequired } from '../../common/middlewares/auth.middleware';
import { UserResponse } from '../../user/responses/user.response';
import { loginValidator } from '../requests/login.request';
import { signupValidator } from '../requests/signup.request';
import { AuthTokenResponse } from '../responses/auth-token.response';
import { AuthService } from '../services/auth.service';

export class AuthController extends RouterClass {
  private readonly authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    super();
    this.authService = authService;
  }

  protected register(): void {
    this.router.post('/signup', ...signupValidator, this.handle(this.signup.bind(this)));
    this.router.post('/login', ...loginValidator, this.handle(this.login.bind(this)));
    this.router.get('/me', authRequired, this.handle(this.me.bind(this)));
  }

  private async signup(req: Request, res: Response): Promise<void> {
    const result = await this.authService.signup({ email: req.body.email, name: req.body.name, password: req.body.password });
    apiOk(res, new AuthTokenResponse(result.token, result.user), HttpStatusCode.CREATED);
  }

  private async login(req: Request, res: Response): Promise<void> {
    const result = await this.authService.login(req.body.email, req.body.password);
    apiOk(res, new AuthTokenResponse(result.token, result.user));
  }

  private async me(req: Request, res: Response): Promise<void> {
    const actor = req.user;
    if (!actor) {
      throw ApiError.unauthorized();
    }
    const user = await this.authService.me(actor.id);
    apiOk(res, new UserResponse(user));
  }
}
