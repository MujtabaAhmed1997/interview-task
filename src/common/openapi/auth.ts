import { jsonBody, jsonResponse, listQueryParams, paginated, ref, standardResponses, uuidPathParam } from './helpers';

export const authOpenApi = {
  '/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new NORMAL user and return a JWT',
      security: [],
      requestBody: jsonBody(ref('SignupRequest')),
      responses: {
        '201': jsonResponse(ref('AuthTokenResponse'), 'User created'),
        ...standardResponses,
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in and return a JWT (rate limited: auth-login)',
      security: [],
      requestBody: jsonBody(ref('LoginRequest')),
      responses: {
        '200': jsonResponse(ref('AuthTokenResponse')),
        ...standardResponses,
      },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Get the authenticated user profile',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse(ref('UserResponse')),
        ...standardResponses,
      },
    },
  },
  '/admin/users': {
    get: {
      tags: ['Users'],
      summary: 'List users (admin, paginated + search)',
      security: [{ bearerAuth: [] }],
      parameters: listQueryParams,
      responses: {
        '200': jsonResponse(paginated('UserResponse')),
        ...standardResponses,
      },
    },
  },
  '/admin/users/{id}/role': {
    patch: {
      tags: ['Users'],
      summary: 'Grant a role to a user (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'User ID')],
      requestBody: jsonBody(ref('UpdateRoleRequest')),
      responses: {
        '200': jsonResponse(ref('UserResponse')),
        ...standardResponses,
      },
    },
  },
};
