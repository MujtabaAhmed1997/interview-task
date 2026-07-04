'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prizes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      contest_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'contests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      rank: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('prizes', { fields: ['contest_id', 'rank'], type: 'unique', name: 'prizes_contest_rank_unique' });

    await queryInterface.createTable('awards', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      contest_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'contests', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      prize_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'prizes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      score: { type: Sequelize.INTEGER, allowNull: false },
      awarded_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('awards', { fields: ['contest_id', 'prize_id'], type: 'unique', name: 'awards_contest_prize_unique' });
    await queryInterface.addIndex('awards', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('awards');
    await queryInterface.dropTable('prizes');
  },
};
