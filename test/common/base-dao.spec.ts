import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { BaseDAO } from '../../src/common/base/base.dao';
import { sequelize } from '../../src/common/config/database';
import { DbSort } from '../../src/common/enums/db-sort.enum';

class WidgetModel extends Model<InferAttributes<WidgetModel>, InferCreationAttributes<WidgetModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

WidgetModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'testWidget', tableName: 'test_widgets' },
);

interface WidgetDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

class WidgetDAO extends BaseDAO<WidgetModel, WidgetDTO> {
  constructor() {
    super(WidgetModel);
  }

  protected toDTO(entity: WidgetModel): WidgetDTO {
    return { id: entity.id, name: entity.name, createdAt: entity.createdAt, updatedAt: entity.updatedAt };
  }
}

const dao = new WidgetDAO();

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
});

describe('BaseDAO', () => {
  it('creates and finds by id', async () => {
    const created = await dao.create({ name: 'alpha' });
    expect(created.id).toBeTruthy();
    const found = await dao.findById(created.id);
    expect(found.name).toBe('alpha');
  });

  it('throws a 404 ApiError for a missing id', async () => {
    await expect(dao.findById('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({ status: 404 });
  });

  it('updates and removes', async () => {
    const created = await dao.create({ name: 'beta' });
    const updated = await dao.update(created.id, { name: 'beta-updated' });
    expect(updated.name).toBe('beta-updated');
    await dao.remove(created.id);
    await expect(dao.findById(created.id)).rejects.toMatchObject({ status: 404 });
  });

  it('paginates with metadata', async () => {
    await dao.create({ name: 'a' });
    await dao.create({ name: 'b' });
    await dao.create({ name: 'c' });
    const page = await dao.paginate({ page: 1, perPage: 2, sort: { createdAt: DbSort.ASC } });
    expect(page.data).toHaveLength(2);
    expect(page.metadata.total).toBe(3);
    expect(page.metadata.lastPage).toBe(2);
    expect(page.metadata.hasNext).toBe(true);
    expect(page.metadata.hasPrevious).toBe(false);
  });
});
