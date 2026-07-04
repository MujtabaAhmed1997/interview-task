import request from 'supertest';
import { createApp } from '../../src/app';
import { openApiDocument } from '../../src/common/openapi/document';
import { disconnectRedis } from '../../src/common/util/redis';

const app = createApp();

afterAll(async () => {
  await disconnectRedis();
});

describe('openapi document', () => {
  it('describes every feature area under one document', () => {
    const paths = Object.keys(openApiDocument.paths);
    expect(paths).toEqual(expect.arrayContaining(['/auth/login', '/contests', '/contests/{id}/leaderboard', '/contests/{id}/prizes', '/me/prizes', '/admin/rate-limit-policies']));
    expect(openApiDocument.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });

  it('serves the swagger ui at /api-docs', async () => {
    const res = await request(app).get('/api-docs/').redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
