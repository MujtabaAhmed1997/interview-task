export const openApiResponseSchemas = {
  UserResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      role: { $ref: '#/components/schemas/UserRole' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  AuthTokenResponse: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      user: { $ref: '#/components/schemas/UserResponse' },
    },
  },
  ContestResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      accessLevel: { $ref: '#/components/schemas/ContestAccessLevel' },
      status: { $ref: '#/components/schemas/ContestStatus' },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      createdBy: { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  OptionAdminResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      text: { type: 'string' },
      isCorrect: { type: 'boolean' },
      position: { type: 'integer' },
    },
  },
  OptionParticipantResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      text: { type: 'string' },
      position: { type: 'integer' },
    },
  },
  QuestionAdminResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      contestId: { type: 'string', format: 'uuid' },
      type: { $ref: '#/components/schemas/QuestionType' },
      text: { type: 'string' },
      points: { type: 'integer' },
      position: { type: 'integer' },
      options: { type: 'array', items: { $ref: '#/components/schemas/OptionAdminResponse' } },
    },
  },
  QuestionParticipantResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      contestId: { type: 'string', format: 'uuid' },
      type: { $ref: '#/components/schemas/QuestionType' },
      text: { type: 'string' },
      points: { type: 'integer' },
      position: { type: 'integer' },
      options: { type: 'array', items: { $ref: '#/components/schemas/OptionParticipantResponse' } },
    },
  },
  ParticipationResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      contestId: { type: 'string', format: 'uuid' },
      userId: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/ParticipationStatus' },
      score: { type: 'number', nullable: true },
      startedAt: { type: 'string', format: 'date-time' },
      submittedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  SubmitResultResponse: {
    type: 'object',
    properties: {
      participationId: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/ParticipationStatus' },
      score: { type: 'number' },
    },
  },
  LeaderboardEntryResponse: {
    type: 'object',
    properties: {
      rank: { type: 'integer' },
      userId: { type: 'string', format: 'uuid' },
      userName: { type: 'string' },
      score: { type: 'number' },
      submittedAt: { type: 'string', format: 'date-time' },
    },
  },
  PrizeResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      contestId: { type: 'string', format: 'uuid' },
      rank: { type: 'integer' },
      title: { type: 'string' },
      description: { type: 'string', nullable: true },
    },
  },
  ContestHistoryResponse: {
    type: 'object',
    properties: {
      participationId: { type: 'string', format: 'uuid' },
      contestId: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/ParticipationStatus' },
      score: { type: 'number', nullable: true },
      startedAt: { type: 'string', format: 'date-time' },
      submittedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  UserPrizeResponse: {
    type: 'object',
    properties: {
      contestId: { type: 'string', format: 'uuid' },
      contestName: { type: 'string' },
      prizeId: { type: 'string', format: 'uuid' },
      prizeTitle: { type: 'string' },
      rank: { type: 'integer' },
      score: { type: 'number' },
      awardedAt: { type: 'string', format: 'date-time' },
    },
  },
  RateLimitPolicyResponse: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      scope: { $ref: '#/components/schemas/RateScope' },
      points: { type: 'integer' },
      durationSec: { type: 'integer' },
      blockSec: { type: 'integer' },
      enabled: { type: 'boolean' },
    },
  },
  PaginationMetadata: {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      page: { type: 'integer' },
      perPage: { type: 'integer' },
      lastPage: { type: 'integer' },
      hasNext: { type: 'boolean' },
      hasPrevious: { type: 'boolean' },
    },
  },
  EmptyResult: { type: 'object', additionalProperties: false },
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'ok' },
      uptime: { type: 'number' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
};
