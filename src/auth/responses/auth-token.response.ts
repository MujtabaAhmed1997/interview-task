import { UserDTO } from '../../user/dtos/user.dto';
import { UserResponse } from '../../user/responses/user.response';

export class AuthTokenResponse {
  token: string;
  user: UserResponse;

  constructor(token: string, user: UserDTO) {
    this.token = token;
    this.user = new UserResponse(user);
  }
}
