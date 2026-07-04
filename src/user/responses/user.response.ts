import { UserRole } from '../../common/enums/user-role.enum';
import { UserDTO } from '../dtos/user.dto';

export class UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;

  constructor(dto: UserDTO) {
    this.id = dto.id;
    this.email = dto.email;
    this.name = dto.name;
    this.role = dto.role;
    this.createdAt = dto.createdAt;
  }
}
