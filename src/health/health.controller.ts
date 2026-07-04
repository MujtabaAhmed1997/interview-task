import { Request, Response } from 'express';
import { RouterClass } from '../common/base/router.class';
import { apiOk } from '../common/errors/api.error';

export class HealthController extends RouterClass {
  constructor() {
    super();
  }

  protected register(): void {
    this.router.get('/', this.check.bind(this));
  }

  private check(_req: Request, res: Response): void {
    apiOk(res, { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  }
}
