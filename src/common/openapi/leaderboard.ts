import { jsonResponse, listQueryParams, paginated, standardResponses, uuidPathParam } from './helpers';

export const leaderboardOpenApi = {
  '/contests/{id}/leaderboard': {
    get: {
      tags: ['Leaderboard'],
      summary: 'Ranked leaderboard for a contest (public, paginated, cached; sorted by score DESC)',
      security: [],
      parameters: [uuidPathParam('id', 'Contest ID'), ...listQueryParams],
      responses: {
        '200': jsonResponse(paginated('LeaderboardEntryResponse')),
        ...standardResponses,
      },
    },
  },
};
