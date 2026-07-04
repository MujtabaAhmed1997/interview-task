'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('rate_limit_policies', [
      { id: 'f0000000-0000-4000-8000-000000000001', name: 'global', scope: 'IP', points: 100, duration_sec: 60, block_sec: 60, enabled: true, created_at: now, updated_at: now },
      { id: 'f0000000-0000-4000-8000-000000000002', name: 'auth-login', scope: 'IP', points: 10, duration_sec: 60, block_sec: 300, enabled: true, created_at: now, updated_at: now },
      { id: 'f0000000-0000-4000-8000-000000000003', name: 'contest-submit', scope: 'USER', points: 5, duration_sec: 60, block_sec: 60, enabled: true, created_at: now, updated_at: now },
      { id: 'f0000000-0000-4000-8000-000000000004', name: 'contest-join', scope: 'USER', points: 20, duration_sec: 60, block_sec: 60, enabled: true, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('rate_limit_policies', null);
  },
};
