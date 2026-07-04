import bcrypt from 'bcryptjs';
import { Op, UniqueConstraintError } from 'sequelize';
import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { ServiceCRUD } from '../../common/base/service.crud';
import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError } from '../../common/errors/api.error';
import { secrets } from '../../common/util/secrets';
import { UserDAO } from '../daos/user.dao';
import { UserDTO } from '../dtos/user.dto';
import { UserErrorCode } from '../enums/user-error-code.enum';
import { CreateUserInput } from '../requests/create-user.request';

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('unmatched-placeholder-password', secrets.bcryptSaltRounds);

export class UserService extends ServiceCRUD<UserDTO, UserDAO> {
  constructor(dao: UserDAO = new UserDAO()) {
    super(dao);
  }

  list(params: PaginationParams): Promise<PaginatedResult<UserDTO>> {
    const where = params.search ? { [Op.or]: [{ email: { [Op.like]: `%${params.search}%` } }, { name: { [Op.like]: `%${params.search}%` } }] } : undefined;
    return this.dao.paginate(params, where);
  }

  async createUser(input: CreateUserInput): Promise<UserDTO> {
    const passwordHash = await bcrypt.hash(input.password, secrets.bcryptSaltRounds);
    try {
      return await this.dao.create({ email: input.email, name: input.name, passwordHash, role: input.role ?? UserRole.NORMAL });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw ApiError.conflict('Email already registered', UserErrorCode.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async verifyCredentials(email: string, password: string): Promise<UserDTO | null> {
    const record = await this.dao.findCredentialsByEmail(email);
    const matches = await bcrypt.compare(password, record?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!record || !matches) {
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
