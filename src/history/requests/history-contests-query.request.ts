import { Request } from 'express';
import { query } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';
import { listQueryValidators } from '../../common/validators/list-query';
import { ParticipationStatus } from '../../participation/enums/participation-status.enum';

export const historyContestsValidator = validate([query('status').optional().isIn(Object.values(ParticipationStatus)).withMessage('invalid status'), ...listQueryValidators()]);

export const parseHistoryStatus = (req: Request): ParticipationStatus | undefined => {
  const status = req.query.status;
  return status === ParticipationStatus.IN_PROGRESS || status === ParticipationStatus.SUBMITTED ? status : undefined;
};
