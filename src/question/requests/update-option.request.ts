import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export interface UpdateOptionInput {
  text?: string;
  isCorrect?: boolean;
  position?: number;
}

export const updateOptionValidator = validate([
  idParam(),
  body('text').optional().isString().trim().notEmpty(),
  body('isCorrect').optional().isBoolean(),
  body('position').optional().isInt({ min: 0 }),
]);
