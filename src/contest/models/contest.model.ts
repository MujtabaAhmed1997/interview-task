import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';

export class ContestModel extends Model<InferAttributes<ContestModel>, InferCreationAttributes<ContestModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare accessLevel: CreationOptional<ContestAccessLevel>;
  declare startTime: Date;
  declare endTime: Date;
  declare createdBy: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ContestModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    accessLevel: { type: DataTypes.ENUM(...Object.values(ContestAccessLevel)), allowNull: false, defaultValue: ContestAccessLevel.NORMAL },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'contest', tableName: 'contests' },
);
