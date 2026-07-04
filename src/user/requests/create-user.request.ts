import { UserRole } from '../../common/enums/user-role.enum';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}
