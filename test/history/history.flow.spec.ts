import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { sequelize } from '../../src/common/config/database';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { disconnectRedis } from '../../src/common/util/redis';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestModel } from '../../src/contest/models/contest.model';
import { ParticipationStatus } from '../../src/participation/enums/participation-status.enum';
import { AwardModel } from '../../src/prize/models/award.model';
import { PrizeModel } from '../../src/prize/models/prize.model';
import { QuestionType } from '../../src/question/enums/question-type.enum';
import { OptionModel } from '../../src/question/models/option.model';
import { QuestionModel } from '../../src/question/models/question.model';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';
const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const login = async (email: string): Promise<string> => (await request(app).post(`${prefix}/auth/login`).send({ email, password: 'password123' })).body.result.token;

let token: string;
let submittedContestId: string;
let openContestId: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await UserModel.create({ email: 'h-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  const user = await UserModel.create({ email: 'h-user@test.local', name: 'Player', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
  token = await login('h-user@test.local');

  const submitted = await ContestModel.create({
    name: 'Submitted',
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  const open = await ContestModel.create({ name: 'Open', accessLevel: ContestAccessLevel.NORMAL, startTime: daysFromNow(-1), endTime: daysFromNow(1), createdBy: admin.id });
  submittedContestId = submitted.id;
  openContestId = open.id;

  const question = await QuestionModel.create({ contestId: submittedContestId, type: QuestionType.SINGLE_SELECT, text: '2+2?', points: 5, position: 0 });
  const correct = await OptionModel.create({ questionId: question.id, text: '4', isCorrect: true, position: 0 });
  await OptionModel.create({ questionId: question.id, text: '5', isCorrect: false, position: 1 });

  await request(app).post(`${prefix}/contests/${submittedContestId}/join`).set('Authorization', `Bearer ${token}`);
  await request(app)
    .post(`${prefix}/contests/${submittedContestId}/answers`)
    .set('Authorization', `Bearer ${token}`)
    .send({ answers: [{ questionId: question.id, optionIds: [correct.id] }] });
  await request(app).post(`${prefix}/contests/${submittedContestId}/submit`).set('Authorization', `Bearer ${token}`);
  await request(app).post(`${prefix}/contests/${openContestId}/join`).set('Authorization', `Bearer ${token}`);

  const prize = await PrizeModel.create({ contestId: submittedContestId, rank: 1, title: 'Champion' });
  await AwardModel.create({ contestId: submittedContestId, userId: user.id, prizeId: prize.id, score: 5, awardedAt: new Date() });
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

describe('history', () => {
  it('requires auth for /me/contests', async () => {
    const res = await request(app).get(`${prefix}/me/contests`);
    expect(res.status).toBe(401);
  });

  it('lists all of the user participations', async () => {
    const res = await request(app).get(`${prefix}/me/contests`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.result.data).toHaveLength(2);
  });

  it('filters participations by status', async () => {
    const res = await request(app).get(`${prefix}/me/contests?status=${ParticipationStatus.IN_PROGRESS}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.result.data).toHaveLength(1);
    expect(res.body.result.data[0].contestId).toBe(openContestId);
    expect(res.body.result.data[0].status).toBe(ParticipationStatus.IN_PROGRESS);
  });

  it('lists the user won prizes', async () => {
    const res = await request(app).get(`${prefix}/me/prizes`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.result.data).toHaveLength(1);
    expect(res.body.result.data[0]).toMatchObject({ prizeTitle: 'Champion', rank: 1, score: 5 });
  });
});
