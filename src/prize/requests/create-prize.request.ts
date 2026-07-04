import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export interface CreatePrizeInput {
  rank?: number;
  title: string;
  description?: string;
}

export const createPrizeValidator = validate([
  idParam(),
  body('rank').optional().isInt({ min: 1 }).withMessage('rank must be a positive integer'),
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('description').optional().isString().trim(),
]);
