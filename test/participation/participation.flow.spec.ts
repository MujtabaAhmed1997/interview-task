import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { sequelize } from '../../src/common/config/database';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { disconnectRedis } from '../../src/common/util/redis';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestModel } from '../../src/contest/models/contest.model';
import { ParticipationErrorCode } from '../../src/participation/enums/participation-error-code.enum';
import { ParticipationStatus } from '../../src/participation/enums/participation-status.enum';
import { QuestionType } from '../../src/question/enums/question-type.enum';
import { OptionModel } from '../../src/question/models/option.model';
import { QuestionModel } from '../../src/question/models/question.model';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const login = async (email: string): Promise<string> => (await request(app).post(`${prefix}/auth/login`).send({ email, password: 'password123' })).body.result.token;

let adminToken: string;
let normalToken: string;
let normalContestId: string;
let vipContestId: string;
let correctSingleOptionId: string;
let correctMultiOptionIds: string[];

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await UserModel.create({ email: 'p-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  await UserModel.create({ email: 'p-normal@test.local', name: 'Normal', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
  adminToken = await login('p-admin@test.local');
  normalToken = await login('p-normal@test.local');

  const normalContest = await ContestModel.create({
    name: 'Active Normal',
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  const vipContest = await ContestModel.create({
    name: 'Active VIP',
    accessLevel: ContestAccessLevel.VIP,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  normalContestId = normalContest.id;
  vipContestId = vipContest.id;

  const single = await QuestionModel.create({ contestId: normalContestId, type: QuestionType.SINGLE_SELECT, text: '2+2?', points: 1, position: 0 });
  const s1 = await OptionModel.create({ questionId: single.id, text: '4', isCorrect: true, position: 0 });
  await OptionModel.create({ questionId: single.id, text: '5', isCorrect: false, position: 1 });
  correctSingleOptionId = s1.id;

  const multi = await QuestionModel.create({ contestId: normalContestId, type: QuestionType.MULTI_SELECT, text: 'Primes?', points: 2, position: 1 });
  const m1 = await OptionModel.create({ questionId: multi.id, text: '2', isCorrect: true, position: 0 });
  const m2 = await OptionModel.create({ questionId: multi.id, text: '3', isCorrect: true, position: 1 });
  await OptionModel.create({ questionId: multi.id, text: '4', isCorrect: false, position: 2 });
  correctMultiOptionIds = [m1.id, m2.id];
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

describe('participation full flow', () => {
  let questionIds: { single: string; multi: string };

  it('requires a token to join (401)', async () => {
    const res = await request(app).post(`${prefix}/contests/${normalContestId}/join`);
    expect(res.status).toBe(401);
  });

  it('lets a normal user join an active normal contest (201 IN_PROGRESS)', async () => {
    const res = await request(app).post(`${prefix}/contests/${normalContestId}/join`).set('Authorization', `Bearer ${normalToken}`);
    expect(res.status).toBe(201);
    expect(res.body.result.status).toBe(ParticipationStatus.IN_PROGRESS);
  });

  it('rejects a second join with 409 ALREADY_JOINED', async () => {
    const res = await request(app).post(`${prefix}/contests/${normalContestId}/join`).set('Authorization', `Bearer ${normalToken}`);
    expect(res.status).toBe(409);
    expect(res.body.errors[0].subCode).toBe(ParticipationErrorCode.ALREADY_JOINED);
  });

  it('forbids a normal user joining a VIP contest (403 ACCESS_DENIED_LEVEL)', async () => {
    const res = await request(app).post(`${prefix}/contests/${vipContestId}/join`).set('Authorization', `Bearer ${normalToken}`);
    expect(res.status).toBe(403);
    expect(res.body.errors[0].subCode).toBe(ParticipationErrorCode.ACCESS_DENIED_LEVEL);
  });

  it('returns questions to a joined participant WITHOUT is_correct', async () => {
    const res = await request(app).get(`${prefix}/contests/${normalContestId}/questions`).set('Authorization', `Bearer ${normalToken}`);
    expect(res.status).toBe(200);
    expect(res.body.result.length).toBe(2);
    for (const question of res.body.result) {
      for (const option of question.options) {
        expect(option).not.toHaveProperty('isCorrect');
      }
    }
    questionIds = { single: res.body.result[0].id, multi: res.body.result[1].id };
  });

  it('exposes is_correct to an admin viewing the same questions', async () => {
    const res = await request(app).get(`${prefix}/contests/${normalContestId}/questions`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.result[0].options[0]).toHaveProperty('isCorrect');
  });

  it('saves answers, submits, and scores correctly (1 + 2 = 3)', async () => {
    const save = await request(app)
      .post(`${prefix}/contests/${normalContestId}/answers`)
      .set('Authorization', `Bearer ${normalToken}`)
      .send({
        answers: [
          { questionId: questionIds.single, optionIds: [correctSingleOptionId] },
          { questionId: questionIds.multi, optionIds: correctMultiOptionIds },
        ],
      });
    expect(save.status).toBe(200);

    const submit = await request(app).post(`${prefix}/contests/${normalContestId}/submit`).set('Authorization', `Bearer ${normalToken}`);
    expect(submit.status).toBe(200);
    expect(submit.body.result.status).toBe(ParticipationStatus.SUBMITTED);
    expect(submit.body.result.score).toBe(3);
  });

  it('rejects a second submit with 409 ALREADY_SUBMITTED', async () => {
    const res = await request(app).post(`${prefix}/contests/${normalContestId}/submit`).set('Authorization', `Bearer ${normalToken}`);
    expect(res.status).toBe(409);
    expect(res.body.errors[0].subCode).toBe(ParticipationErrorCode.ALREADY_SUBMITTED);
  });

  it('rejects an answer that references an option outside the contest (400 INVALID_ANSWER)', async () => {
    const admin = await UserModel.create({ email: 'p-solo@test.local', name: 'Solo', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
    const soloToken = await login('p-solo@test.local');
    expect(admin.id).toBeTruthy();
    await request(app).post(`${prefix}/contests/${normalContestId}/join`).set('Authorization', `Bearer ${soloToken}`);
    const res = await request(app)
      .post(`${prefix}/contests/${normalContestId}/answers`)
      .set('Authorization', `Bearer ${soloToken}`)
      .send({ answers: [{ questionId: questionIds.single, optionIds: ['99999999-9999-4999-8999-999999999999'] }] });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].subCode).toBe(ParticipationErrorCode.INVALID_ANSWER);
  });
});
