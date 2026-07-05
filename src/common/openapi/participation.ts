import { jsonBody, jsonResponse, ref, standardResponses, uuidPathParam } from './helpers';

export const participationOpenApi = {
  '/contests/{id}/join': {
    post: {
      tags: ['Participation'],
      summary: 'Join a contest (access + window gated, rate limited: contest-join)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '201': jsonResponse(ref('ParticipationResponse'), 'Joined contest'),
        ...standardResponses,
      },
    },
  },
  '/contests/{id}/questions': {
    get: {
      tags: ['Participation'],
      summary: 'Get contest questions (admin sees is_correct; participants do not)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '200': jsonResponse({ type: 'array', items: ref('QuestionParticipantResponse') }),
        ...standardResponses,
      },
    },
    post: {
      tags: ['Questions'],
      summary: 'Create a question with options (admin)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      requestBody: jsonBody(ref('CreateQuestionRequest')),
      responses: {
        '201': jsonResponse(ref('QuestionAdminResponse'), 'Question created'),
        ...standardResponses,
      },
    },
  },
  '/contests/{id}/answers': {
    post: {
      tags: ['Participation'],
      summary: 'Save draft answers while in progress',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      requestBody: jsonBody(ref('SaveAnswersRequest')),
      responses: {
        '200': jsonResponse(ref('ParticipationResponse')),
        ...standardResponses,
      },
    },
  },
  '/contests/{id}/submit': {
    post: {
      tags: ['Participation'],
      summary: 'Submit and score (transactional, rate limited: contest-submit)',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Contest ID')],
      responses: {
        '200': jsonResponse(ref('SubmitResultResponse')),
        ...standardResponses,
      },
    },
  },
  '/participations/{id}': {
    get: {
      tags: ['Participation'],
      summary: 'Get your own participation and score',
      security: [{ bearerAuth: [] }],
      parameters: [uuidPathParam('id', 'Participation ID')],
      responses: {
        '200': jsonResponse(ref('ParticipationResponse')),
        ...standardResponses,
      },
    },
  },
};
