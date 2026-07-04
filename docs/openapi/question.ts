export const questionOpenApi = {
  '/contests/{id}/questions': {
    post: { tags: ['Questions'], summary: 'Create a question with options (admin)', security: [{ bearerAuth: [] }] },
  },
  '/questions/{id}': {
    put: { tags: ['Questions'], summary: 'Update a question (admin)', security: [{ bearerAuth: [] }] },
    delete: { tags: ['Questions'], summary: 'Delete a question and its options (admin)', security: [{ bearerAuth: [] }] },
  },
  '/questions/{id}/options': {
    post: { tags: ['Questions'], summary: 'Add an option to a question (admin)', security: [{ bearerAuth: [] }] },
  },
  '/options/{id}': {
    put: { tags: ['Questions'], summary: 'Update an option (admin)', security: [{ bearerAuth: [] }] },
    delete: { tags: ['Questions'], summary: 'Delete an option (admin)', security: [{ bearerAuth: [] }] },
  },
};
