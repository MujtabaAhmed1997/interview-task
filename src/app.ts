import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import './common/types/express';
import { AuthController } from './auth/controllers/auth.controller';
import { RateLimitPolicyName } from './common/enums/rate-limit-policy-name.enum';
import { errorHandler } from './common/middlewares/error-handler.middleware';
import { notFoundHandler } from './common/middlewares/not-found.middleware';
import { openApiDocument } from './common/openapi/document';
import { rateLimit } from './common/ratelimit/rate-limit.middleware';
import { secrets } from './common/util/secrets';
import { ContestController } from './contest/controllers/contest.controller';
import { HealthController } from './health/health.controller';
import { HistoryController } from './history/controllers/history.controller';
import { LeaderboardController } from './leaderboard/controllers/leaderboard.controller';
import { ParticipationController } from './participation/controllers/participation.controller';
import { PrizeController } from './prize/controllers/prize.controller';
import { QuestionController } from './question/controllers/question.controller';
import { RateLimitPolicyController } from './rate-limit-policy/controllers/rate-limit-policy.controller';
import { UserController } from './user/controllers/user.controller';

export const createApp = (): Application => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(`${secrets.apiPrefix}/health`, new HealthController().router);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(rateLimit(RateLimitPolicyName.GLOBAL));

  app.use(`${secrets.apiPrefix}/auth`, new AuthController().router);
  app.use(`${secrets.apiPrefix}/admin/users`, new UserController().router);
  app.use(`${secrets.apiPrefix}/contests`, new ContestController().router);
  app.use(`${secrets.apiPrefix}`, new QuestionController().router);
  app.use(`${secrets.apiPrefix}`, new ParticipationController().router);
  app.use(`${secrets.apiPrefix}`, new LeaderboardController().router);
  app.use(`${secrets.apiPrefix}`, new PrizeController().router);
  app.use(`${secrets.apiPrefix}`, new HistoryController().router);
  app.use(`${secrets.apiPrefix}`, new RateLimitPolicyController().router);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
