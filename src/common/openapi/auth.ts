export const authOpenApi = {
  '/auth/signup': {
    post: { tags: ['Auth'], summary: 'Register a new NORMAL user and return a JWT', security: [] },
  },
  '/auth/login': {
    post: { tags: ['Auth'], summary: 'Log in and return a JWT (rate limited: auth-login)', security: [] },
  },
  '/auth/me': {
    get: { tags: ['Auth'], summary: 'Get the authenticated user profile', security: [{ bearerAuth: [] }] },
  },
  '/admin/users': {
    get: { tags: ['Users'], summary: 'List users (admin, paginated + search)', security: [{ bearerAuth: [] }] },
  },
  '/admin/users/{id}/role': {
    patch: { tags: ['Users'], summary: 'Grant a role to a user (admin)', security: [{ bearerAuth: [] }] },
  },
};
