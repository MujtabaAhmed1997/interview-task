import bcrypt from 'bcryptjs';
import { UniqueConstraintError } from 'sequelize';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { UserDAO } from '../../src/user/daos/user.dao';
import { UserDTO } from '../../src/user/dtos/user.dto';
import { UserErrorCode } from '../../src/user/enums/user-error-code.enum';
import { UserService } from '../../src/user/services/user.service';

function buildDto(overrides: Partial<UserDTO> = {}): UserDTO {
  const dto = new UserDTO();
  dto.id = overrides.id ?? '11111111-1111-1111-1111-111111111111';
  dto.email = overrides.email ?? 'user@test.local';
  dto.name = overrides.name ?? 'Test User';
  dto.role = overrides.role ?? UserRole.NORMAL;
  dto.createdAt = overrides.createdAt ?? new Date();
  dto.updatedAt = overrides.updatedAt ?? new Date();
  return dto;
}

function buildDao(overrides: Partial<UserDAO> = {}): UserDAO {
  return {
    findCredentialsByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdOrNull: jest.fn(),
    update: jest.fn(),
    paginate: jest.fn(),
    ...overrides,
  } as unknown as UserDAO;
}

describe('UserService', () => {
  describe('createUser', () => {
    it('maps a unique-constraint violation to 409 EMAIL_ALREADY_EXISTS', async () => {
      const dao = buildDao({ create: jest.fn().mockRejectedValue(new UniqueConstraintError({ errors: [] })) });
      const service = new UserService(dao);
      await expect(service.createUser({ email: 'user@test.local', name: 'X', password: 'password123' })).rejects.toMatchObject({
        status: 409,
        subCode: UserErrorCode.EMAIL_ALREADY_EXISTS,
      });
    });

    it('hashes the password (never stores plaintext) and defaults role to NORMAL', async () => {
      const created = buildDto();
      const create = jest.fn().mockResolvedValue(created);
      const dao = buildDao({ findCredentialsByEmail: jest.fn().mockResolvedValue(null), create });
      const service = new UserService(dao);

      const result = await service.createUser({ email: 'user@test.local', name: 'Test User', password: 'password123' });

      expect(result).toBe(created);
      const payload = create.mock.calls[0][0];
      expect(payload.passwordHash).not.toBe('password123');
      expect(payload.role).toBe(UserRole.NORMAL);
      expect(bcrypt.compareSync('password123', payload.passwordHash)).toBe(true);
    });
  });

  describe('verifyCredentials', () => {
    it('returns null when the user does not exist', async () => {
      const dao = buildDao({ findCredentialsByEmail: jest.fn().mockResolvedValue(null) });
      const service = new UserService(dao);
      expect(await service.verifyCredentials('missing@test.local', 'password123')).toBeNull();
    });

    it('returns null when the password does not match', async () => {
      const passwordHash = bcrypt.hashSync('correct-password', 4);
      const dao = buildDao({
        findCredentialsByEmail: jest.fn().mockResolvedValue({ id: 'x', email: 'user@test.local', name: 'X', role: UserRole.NORMAL, passwordHash }),
      });
      const service = new UserService(dao);
      expect(await service.verifyCredentials('user@test.local', 'wrong-password')).toBeNull();
    });

    it('returns the user DTO when the password matches', async () => {
      const passwordHash = bcrypt.hashSync('correct-password', 4);
      const dto = buildDto({ id: 'abc' });
      const dao = buildDao({
        findCredentialsByEmail: jest.fn().mockResolvedValue({ id: 'abc', email: 'user@test.local', name: 'X', role: UserRole.NORMAL, passwordHash }),
        findById: jest.fn().mockResolvedValue(dto),
      });
      const service = new UserService(dao);
      expect(await service.verifyCredentials('user@test.local', 'correct-password')).toBe(dto);
    });
  });

  describe('updateRole', () => {
    it('rejects changing your own role with CANNOT_CHANGE_OWN_ROLE', async () => {
      const service = new UserService(buildDao());
      await expect(service.updateRole('same-id', UserRole.VIP, 'same-id')).rejects.toMatchObject({
        status: 400,
        subCode: UserErrorCode.CANNOT_CHANGE_OWN_ROLE,
      });
    });

    it('rejects a missing target with USER_NOT_FOUND', async () => {
      const dao = buildDao({ findByIdOrNull: jest.fn().mockResolvedValue(null) });
      const service = new UserService(dao);
      await expect(service.updateRole('target-id', UserRole.VIP, 'admin-id')).rejects.toMatchObject({
        status: 404,
        subCode: UserErrorCode.USER_NOT_FOUND,
      });
    });

    it('updates the role of an existing target', async () => {
      const updated = buildDto({ role: UserRole.VIP });
      const update = jest.fn().mockResolvedValue(updated);
      const dao = buildDao({ findByIdOrNull: jest.fn().mockResolvedValue(buildDto()), update });
      const service = new UserService(dao);

      const result = await service.updateRole('target-id', UserRole.VIP, 'admin-id');

      expect(result).toBe(updated);
      expect(update).toHaveBeenCalledWith('target-id', { role: UserRole.VIP });
    });
  });

  describe('list', () => {
    it('builds a search where clause when search is present', async () => {
      const paginate = jest.fn().mockResolvedValue({ data: [], metadata: {} });
      const service = new UserService(buildDao({ paginate }));
      await service.list({ page: 1, perPage: 10, search: 'ali' });
      expect(paginate.mock.calls[0][1]).toBeDefined();
    });

    it('passes no where clause when search is absent', async () => {
      const paginate = jest.fn().mockResolvedValue({ data: [], metadata: {} });
      const service = new UserService(buildDao({ paginate }));
      await service.list({ page: 1, perPage: 10 });
      expect(paginate.mock.calls[0][1]).toBeUndefined();
    });
  });
});
