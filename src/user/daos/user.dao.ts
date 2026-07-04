import { BaseDAO } from '../../common/base/base.dao';
import { UserDTO } from '../dtos/user.dto';
import { UserModel } from '../models/user.model';
import { UserCredentialsRecord } from '../types/user-credentials';

export class UserDAO extends BaseDAO<UserModel, UserDTO> {
  constructor() {
    super(UserModel);
  }

  protected toDTO(entity: UserModel): UserDTO {
    const dto = new UserDTO();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentialsRecord | null> {
    const entity = await this.model.findOne({ where: { email } });
    if (!entity) {
      return null;
    }
    return { id: entity.id, email: entity.email, name: entity.name, role: entity.role, passwordHash: entity.passwordHash };
  }
}
