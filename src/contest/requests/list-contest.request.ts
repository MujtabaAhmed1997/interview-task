import { Request } from 'express';
import { query } from 'express-validator';
import { MAX_PER_PAGE } from '../../common/base/pagination';
import { DbSort } from '../../common/enums/db-sort.enum';
import { validate } from '../../common/middlewares/validation.middleware';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';
import { ContestStatus } from '../enums/contest-status.enum';

export const CONTEST_SORTABLE = ['name', 'startTime', 'endTime', 'createdAt'] as const;

export const CONTEST_DEFAULT_SORT = 'createdAt';

export interface ContestFilters {
  status?: ContestStatus;
  accessLevel?: ContestAccessLevel;
}

export const listContestsValidator = validate([
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: MAX_PER_PAGE }),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(CONTEST_SORTABLE),
  query('order').optional().isIn([DbSort.ASC, DbSort.DESC]),
  query('status').optional().isIn(Object.values(ContestStatus)),
  query('accessLevel').optional().isIn(Object.values(ContestAccessLevel)),
]);

export const parseContestFilters = (req: Request): ContestFilters => ({
  status: typeof req.query.status === 'string' ? (req.query.status as ContestStatus) : undefined,
  accessLevel: typeof req.query.accessLevel === 'string' ? (req.query.accessLevel as ContestAccessLevel) : undefined,
});
