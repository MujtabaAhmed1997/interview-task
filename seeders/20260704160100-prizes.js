'use strict';

const NORMAL_CONTEST_ID = 'a0000000-0000-4000-8000-000000000001';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('prizes', [
      { id: 'e0000000-0000-4000-8000-000000000001', contest_id: NORMAL_CONTEST_ID, rank: 1, title: 'Champion', description: 'First place winner', created_at: now, updated_at: now },
      { id: 'e0000000-0000-4000-8000-000000000002', contest_id: NORMAL_CONTEST_ID, rank: 2, title: 'Runner-up', description: 'Second place', created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('prizes', { contest_id: NORMAL_CONTEST_ID });
  },
};
