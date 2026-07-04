import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import './common/types/express';
import { RateLimitPolicyName } from './common/enums/rate-limit-policy-name.enum';
import { errorHandler } from './common/middlewares/error-handler.middleware';
import { notFoundHandler } from './common/middlewares/not-found.middleware';
import { rateLimit } from './common/ratelimit/rate-limit.middleware';
import { secrets } from './common/util/secrets';
import { HealthController } from './health/health.controller';

export const createApp = (): Application => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(`${secrets.apiPrefix}/health`, new HealthController().router);

  app.use(rateLimit(RateLimitPolicyName.GLOBAL));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
