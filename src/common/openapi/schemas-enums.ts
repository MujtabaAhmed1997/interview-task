export const openApiEnumSchemas = {
  ApiErrorDetail: {
    type: 'object',
    required: ['code', 'subCode', 'message'],
    properties: {
      code: { type: 'string', enum: ['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT', 'RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR'] },
      subCode: { type: 'string' },
      message: { type: 'string' },
      field: { type: 'string' },
    },
  },
  UserRole: { type: 'string', enum: ['ADMIN', 'VIP', 'NORMAL'] },
  DbSort: { type: 'string', enum: ['ASC', 'DESC'] },
  ContestAccessLevel: { type: 'string', enum: ['NORMAL', 'VIP'] },
  ContestStatus: { type: 'string', enum: ['UPCOMING', 'ACTIVE', 'ENDED'] },
  ParticipationStatus: { type: 'string', enum: ['IN_PROGRESS', 'SUBMITTED'] },
  QuestionType: { type: 'string', enum: ['SINGLE_SELECT', 'MULTI_SELECT', 'TRUE_FALSE'] },
  RateScope: { type: 'string', enum: ['IP', 'USER'] },
};
