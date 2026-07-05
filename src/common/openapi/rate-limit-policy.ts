import { jsonBody, jsonResponse, ref, standardResponses } from './helpers';

export const rateLimitPolicyOpenApi = {
  '/admin/rate-limit-policies': {
    get: {
      tags: ['Rate limit'],
      summary: 'List rate limit policies (admin)',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse({ type: 'array', items: ref('RateLimitPolicyResponse') }),
        ...standardResponses,
      },
    },
  },
  '/admin/rate-limit-policies/{name}': {
    patch: {
      tags: ['Rate limit'],
      summary: 'Update a rate limit policy (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'name',
          in: 'path' as const,
          required: true,
          schema: { type: 'string' },
          description: 'Policy name (e.g. global, auth-login, contest-join, contest-submit)',
        },
      ],
      requestBody: jsonBody(ref('UpdateRateLimitPolicyRequest')),
      responses: {
        '200': jsonResponse(ref('RateLimitPolicyResponse')),
        ...standardResponses,
      },
    },
  },
};
