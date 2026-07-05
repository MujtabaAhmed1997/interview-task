export const openApiRequestSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'player@example.com' },
      password: { type: 'string', format: 'password', example: 'password123' },
    },
  },
  SignupRequest: {
    type: 'object',
    required: ['email', 'name', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'player@example.com' },
      name: { type: 'string', maxLength: 120, example: 'Player One' },
      password: { type: 'string', minLength: 8, maxLength: 128, example: 'password123' },
    },
  },
  UpdateRoleRequest: {
    type: 'object',
    required: ['role'],
    properties: {
      role: { $ref: '#/components/schemas/UserRole' },
    },
  },
  CreateContestRequest: {
    type: 'object',
    required: ['name', 'accessLevel', 'startTime', 'endTime'],
    properties: {
      name: { type: 'string', maxLength: 200, example: 'Weekly Quiz' },
      description: { type: 'string', nullable: true, example: 'A sample contest' },
      accessLevel: { $ref: '#/components/schemas/ContestAccessLevel' },
      startTime: { type: 'string', format: 'date-time', example: '2026-01-01T00:00:00.000Z' },
      endTime: { type: 'string', format: 'date-time', example: '2030-01-01T00:00:00.000Z' },
    },
  },
  UpdateContestRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 200 },
      description: { type: 'string', nullable: true },
      accessLevel: { $ref: '#/components/schemas/ContestAccessLevel' },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
    },
  },
  CreateQuestionOptionInput: {
    type: 'object',
    required: ['text', 'isCorrect'],
    properties: {
      text: { type: 'string', example: '4' },
      isCorrect: { type: 'boolean', example: true },
      position: { type: 'integer', minimum: 0 },
    },
  },
  CreateQuestionRequest: {
    type: 'object',
    required: ['type', 'text', 'options'],
    properties: {
      type: { $ref: '#/components/schemas/QuestionType' },
      text: { type: 'string', example: 'What is 2 + 2?' },
      points: { type: 'integer', minimum: 0, example: 5 },
      position: { type: 'integer', minimum: 0 },
      options: {
        type: 'array',
        minItems: 2,
        items: { $ref: '#/components/schemas/CreateQuestionOptionInput' },
      },
    },
  },
  UpdateQuestionRequest: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      points: { type: 'integer', minimum: 0 },
      position: { type: 'integer', minimum: 0 },
    },
  },
  CreateOptionRequest: {
    type: 'object',
    required: ['text', 'isCorrect'],
    properties: {
      text: { type: 'string' },
      isCorrect: { type: 'boolean' },
      position: { type: 'integer', minimum: 0 },
    },
  },
  UpdateOptionRequest: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      isCorrect: { type: 'boolean' },
      position: { type: 'integer', minimum: 0 },
    },
  },
  SaveAnswersRequest: {
    type: 'object',
    required: ['answers'],
    properties: {
      answers: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['questionId', 'optionIds'],
          properties: {
            questionId: { type: 'string', format: 'uuid' },
            optionIds: { type: 'array', minItems: 1, items: { type: 'string', format: 'uuid' } },
          },
        },
      },
    },
  },
  CreatePrizeRequest: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', example: 'Champion' },
      rank: { type: 'integer', minimum: 1, example: 1 },
      description: { type: 'string', nullable: true, example: 'First place' },
    },
  },
  UpdateRateLimitPolicyRequest: {
    type: 'object',
    properties: {
      points: { type: 'integer', minimum: 1 },
      durationSec: { type: 'integer', minimum: 1 },
      blockSec: { type: 'integer', minimum: 0 },
      enabled: { type: 'boolean' },
    },
  },
};
