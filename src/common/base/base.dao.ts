import { Attributes, CreationAttributes, Includeable, Model, ModelStatic, Order, Transaction, WhereOptions } from 'sequelize';
import { DbSort } from '../enums/db-sort.enum';
import { ApiError } from '../errors/api.error';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE, MAX_PER_PAGE, PaginatedResult, PaginationParams } from './pagination';

export abstract class BaseDAO<TModel extends Model, TDTO> {
  protected constructor(protected readonly model: ModelStatic<TModel>) {}

  protected abstract toDTO(entity: TModel): TDTO;

  async create(data: CreationAttributes<TModel>, transaction?: Transaction): Promise<TDTO> {
    const created = await this.model.create(data, { transaction });
    return this.toDTO(created);
  }

  async findById(id: string, include?: Includeable[]): Promise<TDTO> {
    const entity = await this.model.findByPk(id, { include });
    if (!entity) {
      throw ApiError.notFound(`${this.model.name} not found`);
    }
    return this.toDTO(entity);
  }

  async findByIdOrNull(id: string, include?: Includeable[]): Promise<TDTO | null> {
    const entity = await this.model.findByPk(id, { include });
    return entity ? this.toDTO(entity) : null;
  }

  async findOne(where: WhereOptions<Attributes<TModel>>, include?: Includeable[]): Promise<TDTO | null> {
    const entity = await this.model.findOne({ where, include });
    return entity ? this.toDTO(entity) : null;
  }

  async exists(where: WhereOptions<Attributes<TModel>>): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async update(id: string, data: Partial<Attributes<TModel>>, transaction?: Transaction): Promise<TDTO> {
    const entity = await this.model.findByPk(id, { transaction });
    if (!entity) {
      throw ApiError.notFound(`${this.model.name} not found`);
    }
    await entity.update(data, { transaction });
    return this.toDTO(entity);
  }

  async remove(id: string, transaction?: Transaction): Promise<void> {
    const removed = await this.model.destroy({ where: { id } as unknown as WhereOptions<Attributes<TModel>>, transaction });
    if (removed === 0) {
      throw ApiError.notFound(`${this.model.name} not found`);
    }
  }

  async paginate(params: PaginationParams, where?: WhereOptions<Attributes<TModel>>, include?: Includeable[]): Promise<PaginatedResult<TDTO>> {
    const page = params.page < 1 ? DEFAULT_PAGE : params.page;
    const perPage = Math.min(params.perPage < 1 ? DEFAULT_PER_PAGE : params.perPage, MAX_PER_PAGE);
    const { rows, count } = await this.model.findAndCountAll({
      where,
      include,
      order: this.buildOrder(params.sort),
      limit: perPage,
      offset: perPage * (page - 1),
    });
    const lastPage = Math.max(1, Math.ceil(count / perPage));
    return {
      data: rows.map((row) => this.toDTO(row)),
      metadata: { total: count, page, perPage, lastPage, hasNext: page < lastPage, hasPrevious: page > 1 },
    };
  }

  protected buildOrder(sort?: Record<string, DbSort>): Order | undefined {
    if (!sort) {
      return undefined;
    }
    return Object.entries(sort).map(([field, direction]) => [field, direction]) as Order;
  }
}
