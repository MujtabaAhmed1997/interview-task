import { secrets } from '../util/secrets';
import { authOpenApi } from './auth';
import { contestOpenApi } from './contest';
import { healthOpenApi } from './health';
import { historyOpenApi } from './history';
import { leaderboardOpenApi } from './leaderboard';
import { participationOpenApi } from './participation';
import { prizeOpenApi } from './prize';
import { questionOpenApi } from './question';
import { rateLimitPolicyOpenApi } from './rate-limit-policy';
import { openApiSchemas } from './schemas';

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Contest Participation System API',
    version: '1.0.0',
    description:
      'Users join contests, answer typed questions, get scored, land on a leaderboard, and win prizes. Roles: Guest, Normal, VIP, Admin. All responses use `{ result, errors }` envelope.',
  },
  servers: [{ url: secrets.apiPrefix, description: 'API base path' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT from POST /auth/login or /auth/signup' },
    },
    schemas: openApiSchemas,
  },
  tags: [
    { name: 'Health', description: 'Service health' },
    { name: 'Auth', description: 'Authentication' },
    { name: 'Users', description: 'User administration' },
    { name: 'Contests', description: 'Contest management' },
    { name: 'Questions', description: 'Question and option management' },
    { name: 'Participation', description: 'Join, answer, and submit' },
    { name: 'Leaderboard', description: 'Contest rankings' },
    { name: 'Prizes', description: 'Prize management and awards' },
    { name: 'History', description: 'User participation and prize history' },
    { name: 'Rate limit', description: 'Rate limit policy configuration' },
  ],
  paths: {
    ...healthOpenApi,
    ...authOpenApi,
    ...contestOpenApi,
    ...questionOpenApi,
    ...participationOpenApi,
    ...leaderboardOpenApi,
    ...prizeOpenApi,
    ...historyOpenApi,
    ...rateLimitPolicyOpenApi,
  },
};
