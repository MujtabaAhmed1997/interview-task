import { Sequelize } from 'sequelize';
import { logger } from '../util/logger';
import { isTest, secrets } from '../util/secrets';

const databaseName = isTest() ? `${secrets.db.name}_test` : secrets.db.name;

export const sequelize = new Sequelize(databaseName, secrets.db.user, secrets.db.password, {
  host: secrets.db.host,
  port: secrets.db.port,
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  logger.info({ event: 'db.connected', database: databaseName });
};

export const disconnectDatabase = async (): Promise<void> => {
  await sequelize.close();
};
