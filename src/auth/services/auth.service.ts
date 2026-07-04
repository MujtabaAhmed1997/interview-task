import { UserRole } from '../../common/enums/user-role.enum';
import { ApiError } from '../../common/errors/api.error';
import { signToken } from '../../common/util/jwt';
import { UserDTO } from '../../user/dtos/user.dto';
import { UserErrorCode } from '../../user/enums/user-error-code.enum';
import { UserService } from '../../user/services/user.service';

export interface SignupInput {
  email: string;
  name: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: UserDTO;
}

export class AuthService {
  private readonly userService: UserService;

  constructor(userService: UserService = new UserService()) {
    this.userService = userService;
  }

  async signup(input: SignupInput): Promise<AuthResult> {
    const user = await this.userService.createUser({ ...input, role: UserRole.NORMAL });
    return { token: this.issueToken(user), user };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userService.verifyCredentials(email, password);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password', UserErrorCode.INVALID_CREDENTIALS);
    }
    return { token: this.issueToken(user), user };
  }

  async me(userId: string): Promise<UserDTO> {
    return this.userService.findById(userId);
  }

  private issueToken(user: UserDTO): string {
    return signToken({ id: user.id, email: user.email, role: user.role });
  }
}
