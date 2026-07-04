import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';

export const loginValidator = validate([body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()]);
