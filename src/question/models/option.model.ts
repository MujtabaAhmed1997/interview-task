import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../common/config/database';

export class OptionModel extends Model<InferAttributes<OptionModel>, InferCreationAttributes<OptionModel>> {
  declare id: CreationOptional<string>;
  declare questionId: string;
  declare text: string;
  declare isCorrect: CreationOptional<boolean>;
  declare position: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OptionModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    questionId: { type: DataTypes.UUID, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    isCorrect: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'option', tableName: 'options' },
);
