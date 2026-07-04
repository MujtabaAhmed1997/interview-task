import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { sequelize } from '../../src/common/config/database';
import { QueueName } from '../../src/common/enums/queue-name.enum';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { getQueue } from '../../src/common/queues/queue.registry';
import { disconnectRedis } from '../../src/common/util/redis';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestModel } from '../../src/contest/models/contest.model';
import { AwardModel } from '../../src/prize/models/award.model';
import { PrizeService } from '../../src/prize/services/prize.service';
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

let adminToken: string;
let normalToken: string;
let contestId: string;
let winnerId: string;
let loserId: string;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await UserModel.create({ email: 'pz-admin@test.local', name: 'Admin', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
  const winner = await UserModel.create({ email: 'pz-winner@test.local', name: 'Winner', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
  const loser = await UserModel.create({ email: 'pz-loser@test.local', name: 'Loser', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.NORMAL });
  winnerId = winner.id;
  loserId = loser.id;
  adminToken = await login('pz-admin@test.local');
  normalToken = await login('pz-winner@test.local');

  const contest = await ContestModel.create({
    name: 'Prize Contest',
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: admin.id,
  });
  contestId = contest.id;
  const question = await QuestionModel.create({ contestId, type: QuestionType.SINGLE_SELECT, text: '2+2?', points: 10, position: 0 });
  const correct = await OptionModel.create({ questionId: question.id, text: '4', isCorrect: true, position: 0 });
  const wrong = await OptionModel.create({ questionId: question.id, text: '5', isCorrect: false, position: 1 });

  await play(contestId, await login('pz-winner@test.local'), question.id, correct.id);
  await play(contestId, await login('pz-loser@test.local'), question.id, wrong.id);
});

afterAll(async () => {
  await getQueue(QueueName.PRIZE_AWARD).obliterate({ force: true });
  await sequelize.drop();
  await sequelize.close();
  await disconnectRedis();
});

describe('prizes', () => {
  it('lets an admin create prizes and rejects a non-admin', async () => {
    const gold = await request(app).post(`${prefix}/contests/${contestId}/prizes`).set('Authorization', `Bearer ${adminToken}`).send({ rank: 1, title: 'Gold' });
    expect(gold.status).toBe(201);
    const silver = await request(app).post(`${prefix}/contests/${contestId}/prizes`).set('Authorization', `Bearer ${adminToken}`).send({ rank: 2, title: 'Silver' });
    expect(silver.status).toBe(201);

    const forbidden = await request(app).post(`${prefix}/contests/${contestId}/prizes`).set('Authorization', `Bearer ${normalToken}`).send({ rank: 3, title: 'Bronze' });
    expect(forbidden.status).toBe(403);
  });

  it('rejects a duplicate rank with 409', async () => {
    const res = await request(app).post(`${prefix}/contests/${contestId}/prizes`).set('Authorization', `Bearer ${adminToken}`).send({ rank: 1, title: 'Gold again' });
    expect(res.status).toBe(409);
  });

  it('lists prizes publicly ordered by rank', async () => {
    const res = await request(app).get(`${prefix}/contests/${contestId}/prizes`);
    expect(res.status).toBe(200);
    expect(res.body.result.map((prize: { rank: number }) => prize.rank)).toEqual([1, 2]);
  });

  it('awards the top submitted participants and is idempotent', async () => {
    const prizeService = new PrizeService();
    await prizeService.runAward(contestId);
    const awards = await AwardModel.findAll({ where: { contestId }, order: [['score', 'DESC']] });
    expect(awards).toHaveLength(2);
    expect(awards[0].userId).toBe(winnerId);
    expect(awards[0].score).toBe(10);
    expect(awards[1].userId).toBe(loserId);

    await prizeService.runAward(contestId);
    const after = await AwardModel.count({ where: { contestId } });
    expect(after).toBe(2);
  });
});
