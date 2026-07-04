import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { ParticipantAnswerOptionModel } from './participant-answer-option.model';

export class ParticipantAnswerModel extends Model<InferAttributes<ParticipantAnswerModel>, InferCreationAttributes<ParticipantAnswerModel>> {
  declare id: CreationOptional<string>;
  declare participationId: string;
  declare questionId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare selectedOptions?: NonAttribute<ParticipantAnswerOptionModel[]>;
}

ParticipantAnswerModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    participationId: { type: DataTypes.UUID, allowNull: false },
    questionId: { type: DataTypes.UUID, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'participantAnswer', tableName: 'participant_answers', indexes: [{ unique: true, fields: ['participation_id', 'question_id'] }] },
);

ParticipantAnswerModel.hasMany(ParticipantAnswerOptionModel, { foreignKey: 'answerId', as: 'selectedOptions', onDelete: 'CASCADE' });
ParticipantAnswerOptionModel.belongsTo(ParticipantAnswerModel, { foreignKey: 'answerId' });
