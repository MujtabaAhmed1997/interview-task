import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { catchAsync } from '../util/catch.async';

export abstract class RouterClass {
  public readonly router: Router;

  protected constructor() {
    this.router = Router();
    this.register();
  }

  protected abstract register(): void;

  protected handle(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
    return catchAsync(handler);
  }
}
