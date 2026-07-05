import { jsonBody, jsonResponse, ref, standardResponses, uuidPathParam } from './helpers';

export const questionOpenApi = {
  '/questions/{id}': {
    put: {
      tags: ['Questions'],
      summary: 'Update a question (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Question ID')],
      requestBody: jsonBody(ref('UpdateQuestionRequest')),
      responses: {
        '200': jsonResponse(ref('QuestionAdminResponse')),
        ...standardResponses,
      },
    },
    delete: {
      tags: ['Questions'],
      summary: 'Delete a question and its options (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Question ID')],
      responses: {
        '200': jsonResponse(ref('EmptyResult')),
        ...standardResponses,
      },
    },
  },
  '/questions/{id}/options': {
    post: {
      tags: ['Questions'],
      summary: 'Add an option to a question (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Question ID')],
      requestBody: jsonBody(ref('CreateOptionRequest')),
      responses: {
        '201': jsonResponse(ref('OptionAdminResponse'), 'Option created'),
        ...standardResponses,
      },
    },
  },
  '/options/{id}': {
    put: {
      tags: ['Questions'],
      summary: 'Update an option (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Option ID')],
      requestBody: jsonBody(ref('UpdateOptionRequest')),
      responses: {
        '200': jsonResponse(ref('OptionAdminResponse')),
        ...standardResponses,
      },
    },
    delete: {
      tags: ['Questions'],
      summary: 'Delete an option (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Option ID')],
      responses: {
        '200': jsonResponse(ref('EmptyResult')),
        ...standardResponses,
      },
    },
  },
};
