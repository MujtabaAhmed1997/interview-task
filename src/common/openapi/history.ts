export const historyOpenApi = {
  '/me/contests': {
    get: { tags: ['History'], summary: 'List my participations (auth, optional status filter)', security: [{ bearerAuth: [] }] },
  },
  '/me/prizes': {
    get: { tags: ['History'], summary: 'List prizes I have won (auth)', security: [{ bearerAuth: [] }] },
  },
};
