import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../common/config/database';

export class PrizeModel extends Model<InferAttributes<PrizeModel>, InferCreationAttributes<PrizeModel>> {
  declare id: CreationOptional<string>;
  declare contestId: string;
  declare rank: CreationOptional<number>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

PrizeModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    contestId: { type: DataTypes.UUID, allowNull: false },
    rank: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'prize', tableName: 'prizes', indexes: [{ unique: true, fields: ['contest_id', 'rank'] }] },
);
