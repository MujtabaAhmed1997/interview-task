const { Sequelize } = require('sequelize');

module.exports = async () => {
  const testDb = `${process.env.DB_NAME || 'contest_system'}_test`;
  const user = process.env.DB_USER || 'contest';
  const admin = new Sequelize('mysql', 'root', process.env.DB_ROOT_PASSWORD || 'root_change_me', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
  });
  await admin.query(`CREATE DATABASE IF NOT EXISTS \`${testDb}\``);
  await admin.query(`GRANT ALL PRIVILEGES ON \`${testDb}\`.* TO '${user}'@'%'`);
  await admin.query('FLUSH PRIVILEGES');
  await admin.close();
};
