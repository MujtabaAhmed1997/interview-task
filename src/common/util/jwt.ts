import jwt from 'jsonwebtoken';
import { UserRole } from '../enums/user-role.enum';
import { AuthUser } from '../types/auth-user';
import { secrets } from './secrets';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export const signToken = (user: AuthUser): string => {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const options: jwt.SignOptions = { expiresIn: secrets.jwt.expiresIn as unknown as number };
  return jwt.sign(payload, secrets.jwt.secret, options);
};

export const verifyToken = (token: string): JwtPayload => jwt.verify(token, secrets.jwt.secret) as JwtPayload;
