import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { cacheService } from '../../src/common/cache/cache.service';
import { sequelize } from '../../src/common/config/database';
import { CacheKeyPrefix } from '../../src/common/enums/cache-key.enum';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { disconnectRedis } from '../../src/common/util/redis';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestErrorCode } from '../../src/contest/enums/contest-error-code.enum';
import { ContestStatus } from '../../src/contest/enums/contest-status.enum';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const daysFromNow = (days: number): string => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

let adminToken: string;
let normalToken: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await cacheService.delByPrefix(CacheKeyPrefix.CONTEST_LIST);
  await cacheService.delByPrefix(CacheKeyPrefix.CONTEST_DETAIL);

  await UserModel.create({ email: 'contest-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  const adminLogin = await request(app).post(`${prefix}/auth/login`).send({ email: 'contest-admin@test.local', password: 'password123' });
  adminToken = adminLogin.body.result.token;

  const normal = await request(app).post(`${prefix}/auth/signup`).send({ email: 'contest-normal@test.local', name: 'Normal', password: 'password123' });
  normalToken = normal.body.result.token;
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

const activeContestPayload = {
  name: 'Integration Active Contest',
  description: 'Runs now',
  accessLevel: ContestAccessLevel.NORMAL,
  startTime: daysFromNow(-1),
  endTime: daysFromNow(1),
};

describe('contest admin CRUD', () => {
  it('lets an admin create a contest and derives its status', async () => {
    const res = await request(app).post(`${prefix}/contests`).set('Authorization', `Bearer ${adminToken}`).send(activeContestPayload);
    expect(res.status).toBe(201);
    expect(res.body.errors).toBeNull();
    expect(res.body.result.status).toBe(ContestStatus.ACTIVE);
    expect(res.body.result.accessLevel).toBe(ContestAccessLevel.NORMAL);
    expect(res.body.result.id).toBeTruthy();
  });

  it('rejects a window where endTime is not after startTime (400)', async () => {
    const res = await request(app)
      .post(`${prefix}/contests`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...activeContestPayload, startTime: daysFromNow(2), endTime: daysFromNow(1) });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].subCode).toBe(ContestErrorCode.INVALID_TIME_WINDOW);
  });

  it('forbids a normal user from creating a contest (403)', async () => {
    const res = await request(app).post(`${prefix}/contests`).set('Authorization', `Bearer ${normalToken}`).send(activeContestPayload);
    expect(res.status).toBe(403);
  });

  it('requires authentication to create a contest (401)', async () => {
    const res = await request(app).post(`${prefix}/contests`).send(activeContestPayload);
    expect(res.status).toBe(401);
  });
});

describe('contest public reads', () => {
  it('lists contests publicly with a paginated envelope', async () => {
    const res = await request(app).get(`${prefix}/contests`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.data)).toBe(true);
    expect(res.body.result.metadata.total).toBeGreaterThan(0);
  });

  it('returns 404 with CONTEST_NOT_FOUND for a missing contest', async () => {
    const res = await request(app).get(`${prefix}/contests/99999999-9999-4999-8999-999999999999`);
    expect(res.status).toBe(404);
    expect(res.body.errors[0].subCode).toBe(ContestErrorCode.CONTEST_NOT_FOUND);
  });

  it('filters the list by status=upcoming', async () => {
    await request(app)
      .post(`${prefix}/contests`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Future Contest', accessLevel: ContestAccessLevel.VIP, startTime: daysFromNow(3), endTime: daysFromNow(5) });

    const res = await request(app).get(`${prefix}/contests?status=${ContestStatus.UPCOMING}`);
    expect(res.status).toBe(200);
    expect(res.body.result.data.length).toBeGreaterThan(0);
    expect(res.body.result.data.every((c: { status: string }) => c.status === ContestStatus.UPCOMING)).toBe(true);
  });
});
