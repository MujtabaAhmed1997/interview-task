import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { cacheService } from '../../src/common/cache/cache.service';
import { sequelize } from '../../src/common/config/database';
import { CacheKeyPrefix } from '../../src/common/enums/cache-key.enum';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { disconnectRedis } from '../../src/common/util/redis';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestModel } from '../../src/contest/models/contest.model';
import { QuestionType } from '../../src/question/enums/question-type.enum';
import { OptionModel } from '../../src/question/models/option.model';
import { QuestionModel } from '../../src/question/models/question.model';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const login = async (email: string): Promise<string> => (await request(app).post(`${prefix}/auth/login`).send({ email, password: 'password123' })).body.result.token;

const play = async (contestId: string, token: string, questionId: string, optionId: string): Promise<void> => {
  await request(app).post(`${prefix}/contests/${contestId}/join`).set('Authorization', `Bearer ${token}`);
  await request(app)
    .post(`${prefix}/contests/${contestId}/answers`)
    .set('Authorization', `Bearer ${token}`)
    .send({ answers: [{ questionId, optionIds: [optionId] }] });
  await request(app).post(`${prefix}/contests/${contestId}/submit`).set('Authorization', `Bearer ${token}`);
};

let contestId: string;
let questionId: string;
let correctOptionId: string;
let wrongOptionId: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await cacheService.delByPrefix(CacheKeyPrefix.CONTEST_LEADERBOARD);

  const admin = await UserModel.create({ email: 'lb-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  await UserModel.create({ email: 'lb-winner@test.local', name: 'Winner', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
  await UserModel.create({ email: 'lb-loser@test.local', name: 'Loser', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });

  const contest = await ContestModel.create({
    name: 'LB Contest',
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  contestId = contest.id;
  const question = await QuestionModel.create({ contestId, type: QuestionType.SINGLE_SELECT, text: '2+2?', points: 5, position: 0 });
  questionId = question.id;
  const correct = await OptionModel.create({ questionId, text: '4', isCorrect: true, position: 0 });
  const wrong = await OptionModel.create({ questionId, text: '5', isCorrect: false, position: 1 });
  correctOptionId = correct.id;
  wrongOptionId = wrong.id;

  await play(contestId, await login('lb-winner@test.local'), questionId, correctOptionId);
  await play(contestId, await login('lb-loser@test.local'), questionId, wrongOptionId);
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

describe('leaderboard', () => {
  it('is public and ranks submitted participants by score descending', async () => {
    const res = await request(app).get(`${prefix}/contests/${contestId}/leaderboard`);
    expect(res.status).toBe(200);
    expect(res.body.result.data).toHaveLength(2);
    expect(res.body.result.data[0]).toMatchObject({ rank: 1, userName: 'Winner', score: 5 });
    expect(res.body.result.data[1]).toMatchObject({ rank: 2, userName: 'Loser', score: 0 });
    expect(res.body.result.metadata.total).toBe(2);
  });

  it('does not leak is_correct and returns paginated metadata', async () => {
    const res = await request(app).get(`${prefix}/contests/${contestId}/leaderboard?perPage=1`);
    expect(res.status).toBe(200);
    expect(res.body.result.data).toHaveLength(1);
    expect(res.body.result.data[0].rank).toBe(1);
    expect(res.body.result.metadata.hasNext).toBe(true);
  });

  it('404s for an unknown contest', async () => {
    const res = await request(app).get(`${prefix}/contests/99999999-9999-4999-8999-999999999999/leaderboard`);
    expect(res.status).toBe(404);
  });
});
