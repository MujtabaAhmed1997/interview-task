import { UserRole } from '../../common/enums/user-role.enum';

export interface UserCredentialsRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
}
