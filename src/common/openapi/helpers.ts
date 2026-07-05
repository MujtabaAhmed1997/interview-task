type OpenApiObject = Record<string, unknown>;

export const ref = (name: string): { $ref: string } => ({ $ref: `#/components/schemas/${name}` });

export const envelope = (result: object | { $ref: string }): OpenApiObject => ({
  type: 'object',
  properties: {
    result,
    errors: { type: 'array', nullable: true, items: ref('ApiErrorDetail') },
  },
});

export const jsonBody = (schema: object | { $ref: string }): OpenApiObject => ({
  required: true,
  content: { 'application/json': { schema } },
});

export const jsonResponse = (schema: object | { $ref: string }, description = 'Success'): OpenApiObject => ({
  description,
  content: { 'application/json': { schema: envelope(schema) } },
});

export const paginated = (itemRef: string): OpenApiObject => ({
  type: 'object',
  properties: {
    data: { type: 'array', items: ref(itemRef) },
    metadata: ref('PaginationMetadata'),
  },
});

export const uuidPathParam = (name = 'id', description?: string): OpenApiObject => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  ...(description ? { description } : {}),
});

export const listQueryParams: OpenApiObject[] = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'perPage', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
  { name: 'search', in: 'query', schema: { type: 'string' } },
  { name: 'sort', in: 'query', schema: { type: 'string' } },
  { name: 'order', in: 'query', schema: ref('DbSort') },
];

export const standardResponses: Record<string, OpenApiObject> = {
  '400': { description: 'Validation error' },
  '401': { description: 'Unauthorized' },
  '403': { description: 'Forbidden' },
  '404': { description: 'Not found' },
  '409': { description: 'Conflict' },
  '429': { description: 'Rate limit exceeded' },
};
