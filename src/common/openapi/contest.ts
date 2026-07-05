import { jsonBody, jsonResponse, listQueryParams, paginated, ref, standardResponses, uuidPathParam } from './helpers';

const contestListParams = [
  ...listQueryParams.map((p) => (p.name === 'sort' ? { ...p, schema: { type: 'string', enum: ['name', 'startTime', 'endTime', 'createdAt'] } } : p)),
  { name: 'status', in: 'query' as const, schema: ref('ContestStatus') },
  { name: 'accessLevel', in: 'query' as const, schema: ref('ContestAccessLevel') },
];

export const contestOpenApi = {
  '/contests': {
    get: {
      tags: ['Contests'],
      summary: 'List contests (paginated, filter by status and accessLevel)',
      security: [],
      parameters: contestListParams,
      responses: {
        '200': jsonResponse(paginated('ContestResponse')),
        ...standardResponses,
      },
    },
    post: {
      tags: ['Contests'],
      summary: 'Create a contest (admin)',
      security: [{ bearerAuth: [] }],
      requestBody: jsonBody(ref('CreateContestRequest')),
      responses: {
        '201': jsonResponse(ref('ContestResponse'), 'Contest created'),
        ...standardResponses,
      },
    },
  },
  '/contests/{id}': {
    get: {
      tags: ['Contests'],
      summary: 'Get contest details',
      security: [],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '200': jsonResponse(ref('ContestResponse')),
        ...standardResponses,
      },
    },
    put: {
      tags: ['Contests'],
      summary: 'Update a contest (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      requestBody: jsonBody(ref('UpdateContestRequest')),
      responses: {
        '200': jsonResponse(ref('ContestResponse')),
        ...standardResponses,
      },
    },
    delete: {
      tags: ['Contests'],
      summary: 'Delete a contest (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '200': jsonResponse(ref('EmptyResult')),
        ...standardResponses,
      },
    },
  },
};
