import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export interface CreateOptionInput {
  text: string;
  isCorrect: boolean;
  position?: number;
}

export const createOptionValidator = validate([idParam(), body('text').isString().trim().notEmpty(), body('isCorrect').isBoolean(), body('position').optional().isInt({ min: 0 })]);
