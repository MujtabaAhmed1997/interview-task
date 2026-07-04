import { UserDTO } from '../../user/dtos/user.dto';

export interface AuthResult {
  token: string;
  user: UserDTO;
}
