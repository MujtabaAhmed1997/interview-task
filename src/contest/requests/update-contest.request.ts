import { body } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';

export interface UpdateContestInput {
  name?: string;
  description?: string;
  accessLevel?: ContestAccessLevel;
  startTime?: Date;
  endTime?: Date;
}

export const updateContestValidator = validate([
  idParam(),
  body('name').optional().isString().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isString().trim(),
  body('accessLevel').optional().isIn(Object.values(ContestAccessLevel)),
  body('startTime').optional().isISO8601().toDate(),
  body('endTime').optional().isISO8601().toDate(),
]);
