'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('participations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      contest_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'contests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      status: { type: Sequelize.ENUM('IN_PROGRESS', 'SUBMITTED'), allowNull: false, defaultValue: 'IN_PROGRESS' },
      score: { type: Sequelize.INTEGER, allowNull: true },
      started_at: { type: Sequelize.DATE, allowNull: false },
      submitted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('participations', { fields: ['contest_id', 'user_id'], type: 'unique', name: 'participations_contest_user_unique' });
    await queryInterface.addIndex('participations', ['contest_id', 'score']);

    await queryInterface.createTable('participant_answers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      participation_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'participations', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      question_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'questions', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('participant_answers', { fields: ['participation_id', 'question_id'], type: 'unique', name: 'participant_answers_unique' });

    await queryInterface.createTable('participant_answer_options', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      answer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'participant_answers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      option_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'options', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('participant_answer_options', ['answer_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('participant_answer_options');
    await queryInterface.dropTable('participant_answers');
    await queryInterface.dropTable('participations');
  },
};
