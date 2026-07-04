import { Op, WhereOptions } from 'sequelize';
import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { ServiceCRUD } from '../../common/base/service.crud';
import { CacheService, cacheService } from '../../common/cache/cache.service';
import { CacheKeyPrefix } from '../../common/enums/cache-key.enum';
import { ApiError } from '../../common/errors/api.error';
import { ContestDAO } from '../daos/contest.dao';
import { ContestDTO } from '../dtos/contest.dto';
import { ContestErrorCode } from '../enums/contest-error-code.enum';
import { ContestStatus } from '../enums/contest-status.enum';
import { CreateContestInput } from '../requests/create-contest.request';
import { ContestFilters } from '../requests/list-contest.request';
import { UpdateContestInput } from '../requests/update-contest.request';
import { deriveContestStatus } from '../responses/contest.response';

export class ContestService extends ServiceCRUD<ContestDTO, ContestDAO> {
  private readonly cache: CacheService;

  constructor(dao: ContestDAO = new ContestDAO(), cache: CacheService = cacheService) {
    super(dao);
    this.cache = cache;
  }

  async listContests(params: PaginationParams, filters: ContestFilters = {}): Promise<PaginatedResult<ContestDTO>> {
    const key = this.buildListKey(params, filters);
    const cached = await this.cache.get<PaginatedResult<ContestDTO>>(key);
    if (cached) {
      return cached;
    }
    const result = await this.dao.paginate(params, this.buildWhere(params, filters));
    await this.cache.set(key, result);
    return result;
  }

  async getById(id: string): Promise<ContestDTO> {
    const key = this.detailKey(id);
    const cached = await this.cache.get<ContestDTO>(key);
    if (cached) {
      return cached;
    }
    const contest = await this.dao.findByIdOrNull(id);
    if (!contest) {
      throw ApiError.notFound('Contest not found', ContestErrorCode.CONTEST_NOT_FOUND);
    }
    await this.cache.set(key, contest);
    return contest;
  }

  async create(input: CreateContestInput, createdBy: string): Promise<ContestDTO> {
    this.assertValidWindow(input.startTime, input.endTime);
    const contest = await this.dao.create({
      name: input.name,
      description: input.description ?? null,
      accessLevel: input.accessLevel,
      startTime: input.startTime,
      endTime: input.endTime,
      createdBy,
    });
    await this.cache.delByPrefix(CacheKeyPrefix.CONTEST_LIST);
    return contest;
  }

  async update(id: string, input: UpdateContestInput): Promise<ContestDTO> {
    const existing = await this.requireContest(id);
    const changingWindow = input.startTime !== undefined || input.endTime !== undefined;
    if (changingWindow && deriveContestStatus(existing.startTime, existing.endTime) !== ContestStatus.UPCOMING) {
      throw ApiError.conflict('Cannot change the schedule of a contest that has already started', ContestErrorCode.CONTEST_ALREADY_STARTED);
    }
    const startTime = input.startTime ?? existing.startTime;
    const endTime = input.endTime ?? existing.endTime;
    this.assertValidWindow(startTime, endTime);
    const updated = await this.dao.update(id, this.toUpdatePayload(input));
    await this.bustCaches(id);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.requireContest(id);
    await this.dao.remove(id);
    await this.bustCaches(id);
  }

  private async requireContest(id: string): Promise<ContestDTO> {
    const existing = await this.dao.findByIdOrNull(id);
    if (!existing) {
      throw ApiError.notFound('Contest not found', ContestErrorCode.CONTEST_NOT_FOUND);
    }
    return existing;
  }

  private assertValidWindow(startTime: Date, endTime: Date): void {
    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      throw ApiError.badRequest('endTime must be after startTime', ContestErrorCode.INVALID_TIME_WINDOW);
    }
  }

  private toUpdatePayload(input: UpdateContestInput): Partial<ContestDTO> {
    const payload: Partial<ContestDTO> = {};
    if (input.name !== undefined) {
      payload.name = input.name;
    }
    if (input.description !== undefined) {
      payload.description = input.description;
    }
    if (input.accessLevel !== undefined) {
      payload.accessLevel = input.accessLevel;
    }
    if (input.startTime !== undefined) {
      payload.startTime = input.startTime;
    }
    if (input.endTime !== undefined) {
      payload.endTime = input.endTime;
    }
    return payload;
  }

  private buildWhere(params: PaginationParams, filters: ContestFilters): WhereOptions | undefined {
    const where: Record<string, unknown> = {};
    if (params.search) {
      where.name = { [Op.like]: `%${params.search}%` };
    }
    if (filters.accessLevel) {
      where.accessLevel = filters.accessLevel;
    }
    if (filters.status) {
      Object.assign(where, this.statusWhere(filters.status));
    }
    return Object.keys(where).length > 0 ? where : undefined;
  }

  private statusWhere(status: ContestStatus, now: Date = new Date()): Record<string, unknown> {
    if (status === ContestStatus.UPCOMING) {
      return { startTime: { [Op.gt]: now } };
    }
    if (status === ContestStatus.ENDED) {
      return { endTime: { [Op.lt]: now } };
    }
    return { startTime: { [Op.lte]: now }, endTime: { [Op.gte]: now } };
  }

  private buildListKey(params: PaginationParams, filters: ContestFilters): string {
    const [sortField, order] = Object.entries(params.sort ?? {})[0] ?? ['createdAt', ''];
    return [CacheKeyPrefix.CONTEST_LIST, params.page, params.perPage, sortField, order, params.search ?? '', filters.status ?? '', filters.accessLevel ?? ''].join(':');
  }

  private detailKey(id: string): string {
    return `${CacheKeyPrefix.CONTEST_DETAIL}:${id}`;
  }

  private async bustCaches(id: string): Promise<void> {
    await Promise.all([this.cache.delByPrefix(CacheKeyPrefix.CONTEST_LIST), this.cache.del(this.detailKey(id))]);
  }
}
