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
import { ContestModel } from '../../src/contest/models/contest.model';
import { QuestionErrorCode } from '../../src/question/enums/question-error-code.enum';
import { QuestionType } from '../../src/question/enums/question-type.enum';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

let adminToken: string;
let normalToken: string;
let contestId: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await cacheService.delByPrefix(CacheKeyPrefix.CONTEST_QUESTIONS);

  const admin = await UserModel.create({ email: 'q-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  adminToken = (await request(app).post(`${prefix}/auth/login`).send({ email: 'q-admin@test.local', password: 'password123' })).body.result.token;
  normalToken = (await request(app).post(`${prefix}/auth/signup`).send({ email: 'q-normal@test.local', name: 'N', password: 'password123' })).body.result.token;

  const contest = await ContestModel.create({
    name: 'Q Contest',
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  contestId = contest.id;
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

const singleSelect = {
  type: QuestionType.SINGLE_SELECT,
  text: 'What is 2 + 2?',
  points: 1,
  options: [
    { text: '4', isCorrect: true },
    { text: '5', isCorrect: false },
  ],
};

describe('question management', () => {
  it('lets an admin create a question and returns options WITH is_correct (admin view)', async () => {
    const res = await request(app).post(`${prefix}/contests/${contestId}/questions`).set('Authorization', `Bearer ${adminToken}`).send(singleSelect);
    expect(res.status).toBe(201);
    expect(res.body.result.type).toBe(QuestionType.SINGLE_SELECT);
    expect(res.body.result.options).toHaveLength(2);
    expect(res.body.result.options.some((o: { isCorrect: boolean }) => o.isCorrect === true)).toBe(true);
    expect(res.body.result.options[0]).toHaveProperty('isCorrect');
  });

  it('forbids a normal user from creating a question (403)', async () => {
    const res = await request(app).post(`${prefix}/contests/${contestId}/questions`).set('Authorization', `Bearer ${normalToken}`).send(singleSelect);
    expect(res.status).toBe(403);
  });

  it('rejects a single-select with two correct options (400 INVALID_OPTION_SET)', async () => {
    const res = await request(app)
      .post(`${prefix}/contests/${contestId}/questions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: QuestionType.SINGLE_SELECT,
        text: 'Bad',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].subCode).toBe(QuestionErrorCode.INVALID_OPTION_SET);
  });

  it('rejects a true/false with three options (400 INVALID_OPTION_SET)', async () => {
    const res = await request(app)
      .post(`${prefix}/contests/${contestId}/questions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: QuestionType.TRUE_FALSE,
        text: 'Bad TF',
        options: [
          { text: 'T', isCorrect: true },
          { text: 'F', isCorrect: false },
          { text: 'Maybe', isCorrect: false },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].subCode).toBe(QuestionErrorCode.INVALID_OPTION_SET);
  });

  it('returns 404 CONTEST_NOT_FOUND when the parent contest is missing', async () => {
    const res = await request(app).post(`${prefix}/contests/99999999-9999-4999-8999-999999999999/questions`).set('Authorization', `Bearer ${adminToken}`).send(singleSelect);
    expect(res.status).toBe(404);
    expect(res.body.errors[0].subCode).toBe(ContestErrorCode.CONTEST_NOT_FOUND);
  });

  it('updates a question and can delete it', async () => {
    const created = await request(app).post(`${prefix}/contests/${contestId}/questions`).set('Authorization', `Bearer ${adminToken}`).send(singleSelect);
    const questionId = created.body.result.id;

    const updated = await request(app).put(`${prefix}/questions/${questionId}`).set('Authorization', `Bearer ${adminToken}`).send({ text: 'Updated text', points: 5 });
    expect(updated.status).toBe(200);
    expect(updated.body.result.text).toBe('Updated text');
    expect(updated.body.result.points).toBe(5);

    const removed = await request(app).delete(`${prefix}/questions/${questionId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(removed.status).toBe(200);
  });

  it('keeps the option set valid when adding options', async () => {
    const created = await request(app).post(`${prefix}/contests/${contestId}/questions`).set('Authorization', `Bearer ${adminToken}`).send(singleSelect);
    const questionId = created.body.result.id;

    const ok = await request(app).post(`${prefix}/questions/${questionId}/options`).set('Authorization', `Bearer ${adminToken}`).send({ text: '6', isCorrect: false });
    expect(ok.status).toBe(201);

    const bad = await request(app).post(`${prefix}/questions/${questionId}/options`).set('Authorization', `Bearer ${adminToken}`).send({ text: '4 again', isCorrect: true });
    expect(bad.status).toBe(400);
    expect(bad.body.errors[0].subCode).toBe(QuestionErrorCode.INVALID_OPTION_SET);
  });
});
