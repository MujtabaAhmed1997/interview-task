import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export interface UpdateQuestionInput {
  text?: string;
  points?: number;
  position?: number;
}

export const updateQuestionValidator = validate([
  idParam(),
  body('text').optional().isString().trim().notEmpty(),
  body('points').optional().isInt({ min: 0 }),
  body('position').optional().isInt({ min: 0 }),
]);
