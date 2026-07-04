const { Sequelize, QueryTypes } = require('sequelize');

module.exports = async () => {
  const testDb = `${process.env.DB_NAME || 'contest_system'}_test`;
  const admin = new Sequelize('postgres', process.env.DB_USER || 'contest', process.env.DB_PASSWORD || 'change_me', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
  });
  const rows = await admin.query('SELECT 1 FROM pg_database WHERE datname = :name', {
    replacements: { name: testDb },
    type: QueryTypes.SELECT,
  });
  if (rows.length === 0) {
    await admin.query(`CREATE DATABASE "${testDb}"`);
  }
  await admin.close();
};
