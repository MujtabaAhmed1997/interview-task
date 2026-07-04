'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      contest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'contests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: { type: Sequelize.ENUM('SINGLE_SELECT', 'MULTI_SELECT', 'TRUE_FALSE'), allowNull: false },
      text: { type: Sequelize.TEXT, allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('questions', ['contest_id']);
    await queryInterface.addIndex('questions', ['contest_id', 'position']);

    await queryInterface.createTable('options', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'questions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      text: { type: Sequelize.TEXT, allowNull: false },
      is_correct: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('options', ['question_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('options');
    await queryInterface.dropTable('questions');
  },
};
