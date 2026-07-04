import { Request } from 'express';
import { query, ValidationChain } from 'express-validator';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, MAX_PER_PAGE, PaginationParams } from '../base/pagination';
import { DbSort } from '../enums/db-sort.enum';

export const listQueryValidators = (): ValidationChain[] => [
  query('page').optional().isInt({ min: 1 }),
  query('perPage').optional().isInt({ min: 1, max: MAX_PER_PAGE }),
  query('search').optional().isString().trim(),
  query('sort').optional().isString(),
  query('order').optional().isIn([DbSort.ASC, DbSort.DESC]),
];

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const parseListQuery = (req: Request, defaultSortField = 'createdAt'): PaginationParams => {
  const page = toPositiveInt(req.query.page, DEFAULT_PAGE);
  const perPage = Math.min(toPositiveInt(req.query.perPage, DEFAULT_PER_PAGE), MAX_PER_PAGE);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const order = req.query.order === DbSort.ASC ? DbSort.ASC : DbSort.DESC;
  const sortField = typeof req.query.sort === 'string' ? req.query.sort : defaultSortField;
  return { page, perPage, search, sort: { [sortField]: order } };
};
