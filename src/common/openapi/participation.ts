export const participationOpenApi = {
  '/contests/{id}/join': {
    post: { tags: ['Participation'], summary: 'Join a contest (access + window gated)', security: [{ bearerAuth: [] }] },
  },
  '/contests/{id}/questions': {
    get: { tags: ['Participation'], summary: 'Get contest questions (role-aware; participants never see is_correct)', security: [{ bearerAuth: [] }] },
  },
  '/contests/{id}/answers': {
    post: { tags: ['Participation'], summary: 'Save draft answers while in progress', security: [{ bearerAuth: [] }] },
  },
  '/contests/{id}/submit': {
    post: { tags: ['Participation'], summary: 'Submit and score (transactional)', security: [{ bearerAuth: [] }] },
  },
  '/participations/{id}': {
    get: { tags: ['Participation'], summary: 'Get your own participation and score', security: [{ bearerAuth: [] }] },
  },
};
