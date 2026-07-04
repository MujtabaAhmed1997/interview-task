import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';
import { QuestionType } from '../enums/question-type.enum';

export interface CreateQuestionOptionInput {
  text: string;
  isCorrect: boolean;
  position?: number;
}

export interface CreateQuestionInput {
  type: QuestionType;
  text: string;
  points?: number;
  position?: number;
  options: CreateQuestionOptionInput[];
}

export const createQuestionValidator = validate([
  idParam(),
  body('type').isIn(Object.values(QuestionType)),
  body('text').isString().trim().notEmpty(),
  body('points').optional().isInt({ min: 0 }),
  body('position').optional().isInt({ min: 0 }),
  body('options').isArray({ min: 2 }),
  body('options.*.text').isString().trim().notEmpty(),
  body('options.*.isCorrect').isBoolean(),
  body('options.*.position').optional().isInt({ min: 0 }),
]);
