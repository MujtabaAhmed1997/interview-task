'use strict';

const { Op } = require('sequelize');

const NORMAL_CONTEST_ID = 'a0000000-0000-4000-8000-000000000001';
const Q_SINGLE = 'c1111111-1111-4111-8111-111111111111';
const Q_MULTI = 'c2222222-2222-4222-8222-222222222222';
const Q_TF = 'c3333333-3333-4333-8333-333333333333';

const option = (id, questionId, text, isCorrect, position) => ({
  id,
  question_id: questionId,
  text,
  is_correct: isCorrect,
  position,
  created_at: new Date(),
  updated_at: new Date(),
});

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('questions', [
      { id: Q_SINGLE, contest_id: NORMAL_CONTEST_ID, type: 'SINGLE_SELECT', text: 'What is 2 + 2?', points: 1, position: 0, created_at: now, updated_at: now },
      { id: Q_MULTI, contest_id: NORMAL_CONTEST_ID, type: 'MULTI_SELECT', text: 'Which of these are prime numbers?', points: 2, position: 1, created_at: now, updated_at: now },
      { id: Q_TF, contest_id: NORMAL_CONTEST_ID, type: 'TRUE_FALSE', text: 'The sky is blue.', points: 1, position: 2, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('options', [
      option('d1111111-1111-4111-8111-111111111111', Q_SINGLE, '3', false, 0),
      option('d1111111-1111-4111-8111-222222222222', Q_SINGLE, '4', true, 1),
      option('d1111111-1111-4111-8111-333333333333', Q_SINGLE, '5', false, 2),
      option('d2222222-2222-4222-8222-111111111111', Q_MULTI, '2', true, 0),
      option('d2222222-2222-4222-8222-222222222222', Q_MULTI, '3', true, 1),
      option('d2222222-2222-4222-8222-333333333333', Q_MULTI, '4', false, 2),
      option('d2222222-2222-4222-8222-444444444444', Q_MULTI, '9', false, 3),
      option('d3333333-3333-4333-8333-111111111111', Q_TF, 'True', true, 0),
      option('d3333333-3333-4333-8333-222222222222', Q_TF, 'False', false, 1),
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('options', { question_id: { [Op.in]: [Q_SINGLE, Q_MULTI, Q_TF] } });
    await queryInterface.bulkDelete('questions', { id: { [Op.in]: [Q_SINGLE, Q_MULTI, Q_TF] } });
  },
};
