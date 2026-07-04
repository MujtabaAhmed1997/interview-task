'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rate_limit_policies', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      scope: { type: Sequelize.ENUM('IP', 'USER'), allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false },
      duration_sec: { type: Sequelize.INTEGER, allowNull: false },
      block_sec: { type: Sequelize.INTEGER, allowNull: false },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rate_limit_policies');
  },
};
