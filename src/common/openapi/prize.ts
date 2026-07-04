export const prizeOpenApi = {
  '/contests/{id}/prizes': {
    get: { tags: ['Prizes'], summary: 'List a contest prizes (public, ordered by rank)', security: [] },
    post: { tags: ['Prizes'], summary: 'Create a prize and schedule the award job (admin)', security: [{ bearerAuth: [] }] },
  },
  '/prizes/{id}': {
    delete: { tags: ['Prizes'], summary: 'Delete a prize (admin)', security: [{ bearerAuth: [] }] },
  },
};
