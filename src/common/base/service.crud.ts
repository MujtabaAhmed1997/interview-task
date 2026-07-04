import { Model, WhereOptions } from 'sequelize';
import { BaseDAO } from './base.dao';
import { PaginatedResult, PaginationParams } from './pagination';

export abstract class ServiceCRUD<TDTO, TDao extends BaseDAO<Model, TDTO> = BaseDAO<Model, TDTO>> {
  protected constructor(protected readonly dao: TDao) {}

  findById(id: string): Promise<TDTO> {
    return this.dao.findById(id);
  }

  list(params: PaginationParams, where?: WhereOptions): Promise<PaginatedResult<TDTO>> {
    return this.dao.paginate(params, where);
  }

  remove(id: string): Promise<void> {
    return this.dao.remove(id);
  }
}
