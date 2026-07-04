import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { QuestionType } from '../enums/question-type.enum';
import { OptionModel } from './option.model';

export class QuestionModel extends Model<InferAttributes<QuestionModel>, InferCreationAttributes<QuestionModel>> {
  declare id: CreationOptional<string>;
  declare contestId: string;
  declare type: QuestionType;
  declare text: string;
  declare points: CreationOptional<number>;
  declare position: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare options?: NonAttribute<OptionModel[]>;
}

QuestionModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    contestId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM(...Object.values(QuestionType)), allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'question', tableName: 'questions' },
);

QuestionModel.hasMany(OptionModel, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
OptionModel.belongsTo(QuestionModel, { foreignKey: 'questionId' });
