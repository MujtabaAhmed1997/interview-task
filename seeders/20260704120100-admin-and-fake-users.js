'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const DEMO_EMAILS = ['vip@contest.local', 'normal@contest.local'];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'change_me_admin', rounds);
    const demoHash = bcrypt.hashSync('password123', rounds);

    await queryInterface.bulkInsert('users', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: process.env.ADMIN_EMAIL || 'admin@contest.local',
        password_hash: adminHash,
        name: process.env.ADMIN_NAME || 'System Admin',
        role: 'ADMIN',
        created_at: now,
        updated_at: now,
      },
      { id: '22222222-2222-2222-2222-222222222222', email: 'vip@contest.local', password_hash: demoHash, name: 'Vivian VIP', role: 'VIP', created_at: now, updated_at: now },
      { id: '33333333-3333-3333-3333-333333333333', email: 'normal@contest.local', password_hash: demoHash, name: 'Nora Normal', role: 'NORMAL', created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@contest.local';
    await queryInterface.bulkDelete('users', { email: { [Op.in]: [adminEmail, ...DEMO_EMAILS] } });
  },
};
