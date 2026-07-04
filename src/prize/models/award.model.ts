import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { ContestModel } from '../../contest/models/contest.model';
import { PrizeModel } from './prize.model';

export class AwardModel extends Model<InferAttributes<AwardModel>, InferCreationAttributes<AwardModel>> {
  declare id: CreationOptional<string>;
  declare contestId: string;
  declare userId: string;
  declare prizeId: string;
  declare score: number;
  declare awardedAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare prize?: NonAttribute<PrizeModel>;
  declare contest?: NonAttribute<ContestModel>;
}

AwardModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    contestId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },
    prizeId: { type: DataTypes.UUID, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false },
    awardedAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'award', tableName: 'awards', indexes: [{ unique: true, fields: ['contest_id', 'prize_id'] }] },
);

AwardModel.belongsTo(PrizeModel, { foreignKey: 'prizeId', as: 'prize' });
AwardModel.belongsTo(ContestModel, { foreignKey: 'contestId', as: 'contest' });
