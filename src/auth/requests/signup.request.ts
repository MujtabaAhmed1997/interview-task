import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';

export interface SignupInput {
  email: string;
  name: string;
  password: string;
}

export const signupValidator = validate([
  body('email').isEmail().normalizeEmail(),
  body('name').isString().trim().notEmpty().isLength({ max: 120 }),
  body('password').isString().isLength({ min: 8, max: 128 }),
]);
