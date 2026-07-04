import bcrypt from 'bcryptjs';
import request from 'supertest';
import { createApp } from '../../src/app';
import { sequelize } from '../../src/common/config/database';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { UserModel } from '../../src/user/models/user.model';

const app = createApp();
const prefix = '/api/v1';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.drop();
  await sequelize.close();
});

describe('auth flow', () => {
  it('signs up, logs in, and reads the current user', async () => {
    const signup = await request(app).post(`${prefix}/auth/signup`).send({ email: 'flow@test.local', name: 'Flow User', password: 'password123' });
    expect(signup.status).toBe(201);
    expect(signup.body.errors).toBeNull();
    expect(signup.body.result.token).toBeTruthy();
    expect(signup.body.result.user.role).toBe(UserRole.NORMAL);
    expect(signup.body.result.user.passwordHash).toBeUndefined();

    const login = await request(app).post(`${prefix}/auth/login`).send({ email: 'flow@test.local', password: 'password123' });
    expect(login.status).toBe(200);
    const token = login.body.result.token;

    const me = await request(app).get(`${prefix}/auth/me`).set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.result.email).toBe('flow@test.local');
    expect(me.body.result.passwordHash).toBeUndefined();
  });

  it('rejects a bad password with 401 INVALID_CREDENTIALS', async () => {
    await request(app).post(`${prefix}/auth/signup`).send({ email: 'wrongpass@test.local', name: 'W', password: 'password123' });
    const res = await request(app).post(`${prefix}/auth/login`).send({ email: 'wrongpass@test.local', password: 'not-the-password' });
    expect(res.status).toBe(401);
    expect(res.body.errors[0].subCode).toBe('INVALID_CREDENTIALS');
  });

  it('rejects a duplicate signup with 409 EMAIL_ALREADY_EXISTS', async () => {
    await request(app).post(`${prefix}/auth/signup`).send({ email: 'dupe@test.local', name: 'D', password: 'password123' });
    const res = await request(app).post(`${prefix}/auth/signup`).send({ email: 'dupe@test.local', name: 'D', password: 'password123' });
    expect(res.status).toBe(409);
    expect(res.body.errors[0].subCode).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects an invalid signup payload with 400', async () => {
    const res = await request(app).post(`${prefix}/auth/signup`).send({ email: 'not-an-email', name: '', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('rejects /auth/me without a token with 401', async () => {
    const res = await request(app).get(`${prefix}/auth/me`);
    expect(res.status).toBe(401);
  });

  it('ignores a role sent in the signup body (no privilege escalation)', async () => {
    const res = await request(app).post(`${prefix}/auth/signup`).send({ email: 'sneaky@test.local', name: 'Sneaky', password: 'password123', role: UserRole.ADMIN });
    expect(res.status).toBe(201);
    expect(res.body.result.user.role).toBe(UserRole.NORMAL);
  });
});

describe('admin user management', () => {
  it('lets an admin grant VIP but forbids a normal user', async () => {
    await UserModel.create({ email: 'boss@test.local', name: 'Boss', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
    const adminLogin = await request(app).post(`${prefix}/auth/login`).send({ email: 'boss@test.local', password: 'password123' });
    const adminToken = adminLogin.body.result.token;

    const normal = await request(app).post(`${prefix}/auth/signup`).send({ email: 'grantme@test.local', name: 'Grant Me', password: 'password123' });
    const normalId = normal.body.result.user.id;
    const normalToken = normal.body.result.token;

    const forbidden = await request(app).patch(`${prefix}/admin/users/${normalId}/role`).set('Authorization', `Bearer ${normalToken}`).send({ role: UserRole.VIP });
    expect(forbidden.status).toBe(403);

    const granted = await request(app).patch(`${prefix}/admin/users/${normalId}/role`).set('Authorization', `Bearer ${adminToken}`).send({ role: UserRole.VIP });
    expect(granted.status).toBe(200);
    expect(granted.body.result.role).toBe(UserRole.VIP);
  });

  it('lists users for an admin (paginated envelope)', async () => {
    await UserModel.create({ email: 'lister@test.local', name: 'Lister', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
    const adminLogin = await request(app).post(`${prefix}/auth/login`).send({ email: 'lister@test.local', password: 'password123' });
    const res = await request(app).get(`${prefix}/admin/users`).set('Authorization', `Bearer ${adminLogin.body.result.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.result.data)).toBe(true);
    expect(res.body.result.metadata.total).toBeGreaterThan(0);
  });

  it('forbids a normal user from listing users (403)', async () => {
    const normal = await request(app).post(`${prefix}/auth/signup`).send({ email: 'nolist@test.local', name: 'No List', password: 'password123' });
    const res = await request(app).get(`${prefix}/admin/users`).set('Authorization', `Bearer ${normal.body.result.token}`);
    expect(res.status).toBe(403);
  });

  it('filters the user list by the search query', async () => {
    await UserModel.create({ email: 'needle-unique@test.local', name: 'Findme', passwordHash: bcrypt.hashSync('password123', 4), role: UserRole.ADMIN });
    const login = await request(app).post(`${prefix}/auth/login`).send({ email: 'needle-unique@test.local', password: 'password123' });
    const res = await request(app).get(`${prefix}/admin/users?search=needle-unique`).set('Authorization', `Bearer ${login.body.result.token}`);
    expect(res.status).toBe(200);
    expect(res.body.result.metadata.total).toBe(1);
    expect(res.body.result.data[0].email).toBe('needle-unique@test.local');
  });
});
