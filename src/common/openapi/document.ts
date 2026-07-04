import { secrets } from '../util/secrets';
import { authOpenApi } from './auth';
import { contestOpenApi } from './contest';
import { historyOpenApi } from './history';
import { leaderboardOpenApi } from './leaderboard';
import { participationOpenApi } from './participation';
import { prizeOpenApi } from './prize';
import { questionOpenApi } from './question';
import { rateLimitPolicyOpenApi } from './rate-limit-policy';

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Contest Participation System API',
    version: '1.0.0',
    description: 'Users join contests, answer typed questions, get scored, land on a leaderboard, and win prizes. Roles: Guest, Normal, VIP, Admin.',
  },
  servers: [{ url: secrets.apiPrefix }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Contests' },
    { name: 'Questions' },
    { name: 'Participation' },
    { name: 'Leaderboard' },
    { name: 'Prizes' },
    { name: 'History' },
    { name: 'Rate limit' },
  ],
  paths: {
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
