export const rateLimitPolicyOpenApi = {
  '/admin/rate-limit-policies': {
    get: { tags: ['Rate limit'], summary: 'List rate limit policies (admin)', security: [{ bearerAuth: [] }] },
  },
  '/admin/rate-limit-policies/{name}': {
    patch: { tags: ['Rate limit'], summary: 'Update a rate limit policy (admin)', security: [{ bearerAuth: [] }] },
  },
};
