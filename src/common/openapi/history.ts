import { jsonResponse, listQueryParams, paginated, ref, standardResponses } from './helpers';

const historyContestParams = [...listQueryParams, { name: 'status', in: 'query' as const, schema: ref('ParticipationStatus') }];

export const historyOpenApi = {
  '/me/contests': {
    get: {
      tags: ['History'],
      summary: 'List my participations (auth, optional status filter)',
      security: [{ bearerAuth: [] }],
      parameters: historyContestParams,
      responses: {
        '200': jsonResponse(paginated('ContestHistoryResponse')),
        ...standardResponses,
      },
    },
  },
  '/me/prizes': {
    get: {
      tags: ['History'],
      summary: 'List prizes I have won (auth)',
      security: [{ bearerAuth: [] }],
      parameters: listQueryParams,
      responses: {
        '200': jsonResponse(paginated('UserPrizeResponse')),
        ...standardResponses,
      },
    },
  },
};
