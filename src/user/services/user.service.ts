import bcrypt from 'bcryptjs';
import { ServiceCRUD } from '../../common/base/service.crud';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError } from '../../common/errors/api.error';
import { secrets } from '../../common/util/secrets';
import { UserDAO } from '../daos/user.dao';
import { UserDTO } from '../dtos/user.dto';
import { UserErrorCode } from '../enums/user-error-code.enum';
import { CreateUserInput } from '../requests/create-user.request';

export class UserService extends ServiceCRUD<UserDTO, UserDAO> {
  constructor(dao: UserDAO = new UserDAO()) {
    super(dao);
  }

  async createUser(input: CreateUserInput): Promise<UserDTO> {
    const existing = await this.dao.findCredentialsByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('Email already registered', UserErrorCode.EMAIL_ALREADY_EXISTS);
    }
    const passwordHash = await bcrypt.hash(input.password, secrets.bcryptSaltRounds);
    return this.dao.create({ email: input.email, name: input.name, passwordHash, role: input.role ?? UserRole.NORMAL });
  }

  async verifyCredentials(email: string, password: string): Promise<UserDTO | null> {
    const record = await this.dao.findCredentialsByEmail(email);
    if (!record) {
      return null;
    }
    const matches = await bcrypt.compare(password, record.passwordHash);
    if (!matches) {
      return null;
    }
    return this.dao.findById(record.id);
  }

  async updateRole(targetUserId: string, role: UserRole, actingUserId: string): Promise<UserDTO> {
    if (targetUserId === actingUserId) {
      throw ApiError.badRequest('You cannot change your own role', UserErrorCode.CANNOT_CHANGE_OWN_ROLE);
    }
    const target = await this.dao.findByIdOrNull(targetUserId);
    if (!target) {
      throw ApiError.notFound('User not found', UserErrorCode.USER_NOT_FOUND);
    }
    return this.dao.update(targetUserId, { role });
  }
}
