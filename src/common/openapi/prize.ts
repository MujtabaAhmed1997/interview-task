import { jsonBody, jsonResponse, ref, standardResponses, uuidPathParam } from './helpers';

export const prizeOpenApi = {
  '/contests/{id}/prizes': {
    get: {
      tags: ['Prizes'],
      summary: 'List a contest prizes (public, ordered by rank)',
      security: [],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '200': jsonResponse({ type: 'array', items: ref('PrizeResponse') }),
        ...standardResponses,
      },
    },
    post: {
      tags: ['Prizes'],
      summary: 'Create a prize and schedule the award job (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      requestBody: jsonBody(ref('CreatePrizeRequest')),
      responses: {
        '201': jsonResponse(ref('PrizeResponse'), 'Prize created'),
        ...standardResponses,
      },
    },
  },
  '/prizes/{id}': {
    delete: {
      tags: ['Prizes'],
      summary: 'Delete a prize (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Prize ID')],
      responses: {
        '200': jsonResponse(ref('EmptyResult')),
        ...standardResponses,
      },
    },
  },
};
