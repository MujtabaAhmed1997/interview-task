import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { UserModel } from '../../user/models/user.model';
import { ParticipationStatus } from '../enums/participation-status.enum';
import { ParticipantAnswerModel } from './participant-answer.model';

export class ParticipationModel extends Model<InferAttributes<ParticipationModel>, InferCreationAttributes<ParticipationModel>> {
  declare id: CreationOptional<string>;
  declare contestId: string;
  declare userId: string;
  declare status: CreationOptional<ParticipationStatus>;
  declare score: CreationOptional<number | null>;
  declare startedAt: Date;
  declare submittedAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare answers?: NonAttribute<ParticipantAnswerModel[]>;
  declare user?: NonAttribute<UserModel>;
}

ParticipationModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    contestId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM(...Object.values(ParticipationStatus)), allowNull: false, defaultValue: ParticipationStatus.IN_PROGRESS },
    score: { type: DataTypes.INTEGER, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: false },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'participation', tableName: 'participations', indexes: [{ unique: true, fields: ['contest_id', 'user_id'] }] },
);

ParticipationModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
