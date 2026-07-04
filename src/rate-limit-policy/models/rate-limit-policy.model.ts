import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../common/config/database';
import { RateScope } from '../../common/enums/rate-scope.enum';

export class RateLimitPolicyModel extends Model<InferAttributes<RateLimitPolicyModel>, InferCreationAttributes<RateLimitPolicyModel>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare scope: RateScope;
  declare points: number;
  declare durationSec: number;
  declare blockSec: number;
  declare enabled: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RateLimitPolicyModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    scope: { type: DataTypes.ENUM(...Object.values(RateScope)), allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false },
    durationSec: { type: DataTypes.INTEGER, allowNull: false },
    blockSec: { type: DataTypes.INTEGER, allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, modelName: 'rateLimitPolicy', tableName: 'rate_limit_policies' },
);
