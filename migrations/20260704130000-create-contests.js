'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contests', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      access_level: { type: Sequelize.ENUM('NORMAL', 'VIP'), allowNull: false, defaultValue: 'NORMAL' },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('contests', ['created_by']);
    await queryInterface.addIndex('contests', ['access_level']);
    await queryInterface.addIndex('contests', ['start_time']);
    await queryInterface.addIndex('contests', ['end_time']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contests');
  },
};
