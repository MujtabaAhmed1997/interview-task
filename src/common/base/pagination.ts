import { DbSort } from '../enums/db-sort.enum';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 100;

export interface PaginationParams {
  page: number;
  perPage: number;
  sort?: Record<string, DbSort>;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: PaginationMetadata;
}
