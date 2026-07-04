import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { sequelize } from '../../src/common/config/database';
import { RateLimitPolicyName } from '../../src/common/enums/rate-limit-policy-name.enum';
import { RateScope } from '../../src/common/enums/rate-scope.enum';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { disconnectRedis } from '../../src/common/util/redis';
import { RateLimitPolicyModel } from '../../src/rate-limit-policy/models/rate-limit-policy.model';
import { rateLimitPolicyAdminService } from '../../src/rate-limit-policy/services/rate-limit-policy-admin.service';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const login = (email: string, password = 'password123'): request.Test => request(app).post(`${prefix}/auth/login`).send({ email, password });

let adminToken: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await RateLimitPolicyModel.bulkCreate([
    { name: RateLimitPolicyName.GLOBAL, scope: RateScope.IP, points: 100, durationSec: 60, blockSec: 60, enabled: true },
    { name: RateLimitPolicyName.AUTH_LOGIN, scope: RateScope.IP, points: 10, durationSec: 60, blockSec: 300, enabled: true },
    { name: RateLimitPolicyName.CONTEST_JOIN, scope: RateScope.USER, points: 20, durationSec: 60, blockSec: 60, enabled: true },
  ]);
  await UserModel.create({ email: 'rl-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  adminToken = (await login('rl-admin@test.local')).body.result.token;
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

describe('rate limit policies', () => {
  it('loads DB policies into the runtime limiter', async () => {
    await rateLimitPolicyAdminService.loadIntoRuntime();
    const res = await request(app).get(`${prefix}/admin/rate-limit-policies`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.result.map((policy: { name: string }) => policy.name)).toContain(RateLimitPolicyName.AUTH_LOGIN);
  });

  it('rejects a non-admin from listing policies', async () => {
    const res = await request(app).get(`${prefix}/admin/rate-limit-policies`);
    expect(res.status).toBe(401);
  });

  it('lets an admin update a policy', async () => {
    const res = await request(app)
      .patch(`${prefix}/admin/rate-limit-policies/${RateLimitPolicyName.CONTEST_JOIN}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ points: 30 });
    expect(res.status).toBe(200);
    expect(res.body.result.points).toBe(30);
  });

  it('404s updating an unknown policy', async () => {
    const res = await request(app).patch(`${prefix}/admin/rate-limit-policies/does-not-exist`).set('Authorization', `Bearer ${adminToken}`).send({ points: 5 });
    expect(res.status).toBe(404);
  });

  it('blocks repeated logins beyond the auth-login limit with 429', async () => {
    let blocked = false;
    for (let attempt = 0; attempt < 14; attempt += 1) {
      const res = await login('rl-nobody@test.local', 'wrong-password');
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });
});
