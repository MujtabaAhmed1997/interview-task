import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../common/config/database';

export class ParticipantAnswerOptionModel extends Model<InferAttributes<ParticipantAnswerOptionModel>, InferCreationAttributes<ParticipantAnswerOptionModel>> {
  declare id: CreationOptional<string>;
  declare answerId: string;
  declare optionId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ParticipantAnswerOptionModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    answerId: { type: DataTypes.UUID, allowNull: false },
    optionId: { type: DataTypes.UUID, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'participantAnswerOption', tableName: 'participant_answer_options' },
);
