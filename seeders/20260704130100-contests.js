'use strict';

const { Op } = require('sequelize');

const ADMIN_ID = '11111111-1111-1111-1111-111111111111';
const NORMAL_CONTEST_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const VIP_CONTEST_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('contests', [
      {
        id: NORMAL_CONTEST_ID,
        name: 'Weekly Trivia Sprint',
        description: 'An open contest for everyone. Answer fast, score high.',
        access_level: 'NORMAL',
        start_time: daysFromNow(-1),
        end_time: daysFromNow(1),
        created_by: ADMIN_ID,
        created_at: now,
        updated_at: now,
      },
      {
        id: VIP_CONTEST_ID,
        name: 'VIP Grand Challenge',
        description: 'A premium contest reserved for VIP members.',
        access_level: 'VIP',
        start_time: daysFromNow(2),
        end_time: daysFromNow(5),
        created_by: ADMIN_ID,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('contests', { id: { [Op.in]: [NORMAL_CONTEST_ID, VIP_CONTEST_ID] } });
  },
};
