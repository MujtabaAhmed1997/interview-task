import request from 'supertest';
import { createApp } from '../src/app';

describe('GET /api/v1/health', () => {
  it('returns an ok envelope', async () => {
    const response = await request(createApp()).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.errors).toBeNull();
    expect(response.body.result.status).toBe('ok');
  });

  it('returns a 404 envelope for an unknown route', async () => {
    const response = await request(createApp()).get('/api/v1/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.result).toBeNull();
    expect(response.body.errors[0].subCode).toBeDefined();
  });
});
