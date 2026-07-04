export const contestOpenApi = {
  '/contests': {
    get: { tags: ['Contests'], summary: 'List contests (paginated, filter by status and accessLevel)', security: [] },
    post: { tags: ['Contests'], summary: 'Create a contest (admin)', security: [{ bearerAuth: [] }] },
  },
  '/contests/{id}': {
    get: { tags: ['Contests'], summary: 'Get contest details', security: [] },
    put: { tags: ['Contests'], summary: 'Update a contest (admin)', security: [{ bearerAuth: [] }] },
    delete: { tags: ['Contests'], summary: 'Delete a contest (admin)', security: [{ bearerAuth: [] }] },
  },
};
