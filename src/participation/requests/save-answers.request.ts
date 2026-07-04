import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';
import { SelectedAnswer } from '../types/selected-answer';

export interface SaveAnswersInput {
  answers: SelectedAnswer[];
}

export const saveAnswersValidator = validate([
  idParam(),
  body('answers').isArray({ min: 1 }),
  body('answers.*.questionId').isUUID(),
  body('answers.*.optionIds').isArray({ min: 1 }),
  body('answers.*.optionIds.*').isUUID(),
]);
