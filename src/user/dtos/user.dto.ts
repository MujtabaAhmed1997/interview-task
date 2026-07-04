import { DTO } from '../../common/base/dto';
import { UserRole } from '../../common/enums/user-role.enum';

export class UserDTO extends DTO {
  email!: string;
  name!: string;
  role!: UserRole;
}
