import { jsonResponse, ref, standardResponses } from './helpers';

export const healthOpenApi = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      security: [],
      responses: {
        '200': jsonResponse(ref('HealthResponse')),
        ...standardResponses,
      },
    },
  },
};
