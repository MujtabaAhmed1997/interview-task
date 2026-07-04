import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';

export interface CreateContestInput {
  name: string;
  description?: string;
  accessLevel: ContestAccessLevel;
  startTime: Date;
  endTime: Date;
}

export const createContestValidator = validate([
  body('name').isString().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isString().trim(),
  body('accessLevel').isIn(Object.values(ContestAccessLevel)),
  body('startTime').isISO8601().toDate(),
  body('endTime').isISO8601().toDate(),
]);
