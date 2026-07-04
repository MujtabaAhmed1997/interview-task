import { UserRole } from '../../src/common/enums/user-role.enum';
import { AuthUser } from '../../src/common/types/auth-user';
import { ContestDTO } from '../../src/contest/dtos/contest.dto';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestService } from '../../src/contest/services/contest.service';
import { ParticipationDAO } from '../../src/participation/daos/participation.dao';
import { ParticipationErrorCode } from '../../src/participation/enums/participation-error-code.enum';
import { ParticipationStatus } from '../../src/participation/enums/participation-status.enum';
import { ParticipationService } from '../../src/participation/services/participation.service';
import { QuestionService } from '../../src/question/services/question.service';

const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

function contest(overrides: Partial<ContestDTO> = {}): ContestDTO {
  return Object.assign(new ContestDTO(), {
    id: 'contest-1',
    name: 'C',
    description: null,
    accessLevel: ContestAccessLevel.NORMAL,
    startTime: daysFromNow(-1),
    endTime: daysFromNow(1),
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

const user = (role: UserRole): AuthUser => ({ id: 'user-1', email: 'u@test.local', role });

function build(contestDto: ContestDTO, findResult: unknown = null): ParticipationService {
  const contestService = { getById: jest.fn().mockResolvedValue(contestDto) } as unknown as ContestService;
  const dao = { findByContestAndUser: jest.fn().mockResolvedValue(findResult), create: jest.fn() } as unknown as ParticipationDAO;
  return new ParticipationService(dao, contestService, {} as QuestionService, { delByPrefix: jest.fn() } as never);
}

describe('ParticipationService.join', () => {
  it('denies a NORMAL user joining a VIP contest with ACCESS_DENIED_LEVEL', async () => {
    const service = build(contest({ accessLevel: ContestAccessLevel.VIP }));
    await expect(service.join('contest-1', user(UserRole.NORMAL))).rejects.toMatchObject({ status: 403, subCode: ParticipationErrorCode.ACCESS_DENIED_LEVEL });
  });

  it('rejects joining a contest that is not active with CONTEST_NOT_ACTIVE', async () => {
    const service = build(contest({ startTime: daysFromNow(-5), endTime: daysFromNow(-2) }));
    await expect(service.join('contest-1', user(UserRole.NORMAL))).rejects.toMatchObject({ status: 400, subCode: ParticipationErrorCode.CONTEST_NOT_ACTIVE });
  });

  it('rejects a second join with ALREADY_JOINED', async () => {
    const service = build(contest(), { id: 'p1', status: ParticipationStatus.IN_PROGRESS });
    await expect(service.join('contest-1', user(UserRole.NORMAL))).rejects.toMatchObject({ status: 409, subCode: ParticipationErrorCode.ALREADY_JOINED });
  });

  it('lets a VIP user join a VIP contest', async () => {
    const created = { id: 'p1', status: ParticipationStatus.IN_PROGRESS };
    const contestService = { getById: jest.fn().mockResolvedValue(contest({ accessLevel: ContestAccessLevel.VIP })) } as unknown as ContestService;
    const dao = { findByContestAndUser: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(created) } as unknown as ParticipationDAO;
    const service = new ParticipationService(dao, contestService, {} as QuestionService, { delByPrefix: jest.fn() } as never);
    await expect(service.join('contest-1', user(UserRole.VIP))).resolves.toBe(created);
  });
});

describe('ParticipationService.submit guards', () => {
  it('rejects submitting when the user has not joined (NOT_JOINED)', async () => {
    const service = build(contest(), null);
    await expect(service.submit('contest-1', 'user-1')).rejects.toMatchObject({ status: 403, subCode: ParticipationErrorCode.NOT_JOINED });
  });

  it('rejects submitting an already submitted participation (ALREADY_SUBMITTED)', async () => {
    const service = build(contest(), { id: 'p1', status: ParticipationStatus.SUBMITTED });
    await expect(service.submit('contest-1', 'user-1')).rejects.toMatchObject({ status: 409, subCode: ParticipationErrorCode.ALREADY_SUBMITTED });
  });
});
