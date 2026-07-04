import { CacheService } from '../../src/common/cache/cache.service';
import { CacheKeyPrefix } from '../../src/common/enums/cache-key.enum';
import { ContestDAO } from '../../src/contest/daos/contest.dao';
import { ContestDTO } from '../../src/contest/dtos/contest.dto';
import { ContestAccessLevel } from '../../src/contest/enums/contest-access-level.enum';
import { ContestErrorCode } from '../../src/contest/enums/contest-error-code.enum';
import { ContestStatus } from '../../src/contest/enums/contest-status.enum';
import { deriveContestStatus } from '../../src/contest/responses/contest.response';
import { ContestService } from '../../src/contest/services/contest.service';

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';

function buildDto(overrides: Partial<ContestDTO> = {}): ContestDTO {
  const dto = new ContestDTO();
  dto.id = overrides.id ?? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  dto.name = overrides.name ?? 'Test Contest';
  dto.description = overrides.description ?? null;
  dto.accessLevel = overrides.accessLevel ?? ContestAccessLevel.NORMAL;
  dto.startTime = overrides.startTime ?? new Date('2030-01-01T00:00:00Z');
  dto.endTime = overrides.endTime ?? new Date('2030-01-02T00:00:00Z');
  dto.createdBy = overrides.createdBy ?? ADMIN_ID;
  dto.createdAt = overrides.createdAt ?? new Date();
  dto.updatedAt = overrides.updatedAt ?? new Date();
  return dto;
}

function buildDao(overrides: Partial<ContestDAO> = {}): ContestDAO {
  return {
    paginate: jest.fn(),
    findByIdOrNull: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    ...overrides,
  } as unknown as ContestDAO;
}

function buildCache(overrides: Partial<CacheService> = {}): CacheService {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    del: jest.fn(),
    delByPrefix: jest.fn(),
    ...overrides,
  } as unknown as CacheService;
}

describe('deriveContestStatus', () => {
  const now = new Date('2026-07-04T12:00:00Z');

  it('is UPCOMING before the start time', () => {
    expect(deriveContestStatus(new Date('2026-07-05'), new Date('2026-07-06'), now)).toBe(ContestStatus.UPCOMING);
  });

  it('is ACTIVE between start and end', () => {
    expect(deriveContestStatus(new Date('2026-07-03'), new Date('2026-07-05'), now)).toBe(ContestStatus.ACTIVE);
  });

  it('is ENDED after the end time', () => {
    expect(deriveContestStatus(new Date('2026-07-01'), new Date('2026-07-02'), now)).toBe(ContestStatus.ENDED);
  });
});

describe('ContestService', () => {
  describe('create', () => {
    it('rejects a window where endTime is not after startTime', async () => {
      const service = new ContestService(buildDao(), buildCache());
      await expect(
        service.create({ name: 'X', accessLevel: ContestAccessLevel.NORMAL, startTime: new Date('2030-01-02'), endTime: new Date('2030-01-01') }, ADMIN_ID),
      ).rejects.toMatchObject({ status: 400, subCode: ContestErrorCode.INVALID_TIME_WINDOW });
    });

    it('creates with the acting admin as createdBy and busts the list cache', async () => {
      const created = buildDto();
      const create = jest.fn().mockResolvedValue(created);
      const cache = buildCache();
      const service = new ContestService(buildDao({ create }), cache);

      const result = await service.create({ name: 'X', accessLevel: ContestAccessLevel.VIP, startTime: new Date('2030-01-01'), endTime: new Date('2030-01-02') }, ADMIN_ID);

      expect(result).toBe(created);
      expect(create.mock.calls[0][0].createdBy).toBe(ADMIN_ID);
      expect(cache.delByPrefix).toHaveBeenCalledWith(CacheKeyPrefix.CONTEST_LIST);
    });
  });

  describe('list', () => {
    it('returns the cached page without touching the dao on a cache hit', async () => {
      const cachedPage = { data: [buildDto()], metadata: { total: 1, page: 1, perPage: 10, lastPage: 1, hasNext: false, hasPrevious: false } };
      const paginate = jest.fn();
      const cache = buildCache({ get: jest.fn().mockResolvedValue(cachedPage) });
      const service = new ContestService(buildDao({ paginate }), cache);

      const result = await service.listContests({ page: 1, perPage: 10 }, {});

      expect(result).toBe(cachedPage);
      expect(paginate).not.toHaveBeenCalled();
    });

    it('queries the dao and caches the page on a cache miss', async () => {
      const page = { data: [], metadata: { total: 0, page: 1, perPage: 10, lastPage: 1, hasNext: false, hasPrevious: false } };
      const paginate = jest.fn().mockResolvedValue(page);
      const cache = buildCache();
      const service = new ContestService(buildDao({ paginate }), cache);

      await service.listContests({ page: 1, perPage: 10, search: 'trivia' }, { status: ContestStatus.ACTIVE });

      expect(paginate).toHaveBeenCalledTimes(1);
      expect(cache.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('blocks a schedule change once the contest has started', async () => {
      const active = buildDto({ startTime: new Date(Date.now() - 60_000), endTime: new Date(Date.now() + 60_000) });
      const service = new ContestService(buildDao({ findByIdOrNull: jest.fn().mockResolvedValue(active) }), buildCache());

      await expect(service.update(active.id, { endTime: new Date(Date.now() + 120_000) })).rejects.toMatchObject({
        status: 409,
        subCode: ContestErrorCode.CONTEST_ALREADY_STARTED,
      });
    });

    it('rejects an update on a missing contest with CONTEST_NOT_FOUND', async () => {
      const service = new ContestService(buildDao({ findByIdOrNull: jest.fn().mockResolvedValue(null) }), buildCache());
      await expect(service.update('missing-id', { name: 'New' })).rejects.toMatchObject({ status: 404, subCode: ContestErrorCode.CONTEST_NOT_FOUND });
    });
  });

  describe('getById', () => {
    it('throws CONTEST_NOT_FOUND when the contest does not exist', async () => {
      const service = new ContestService(buildDao({ findByIdOrNull: jest.fn().mockResolvedValue(null) }), buildCache());
      await expect(service.getById('missing-id')).rejects.toMatchObject({ status: 404, subCode: ContestErrorCode.CONTEST_NOT_FOUND });
    });
  });
});
