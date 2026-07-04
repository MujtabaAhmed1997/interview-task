import { body, param } from 'express-validator';
import { validate } from '../../common/middlewares/validation.middleware';

export interface UpdatePolicyInput {
  points?: number;
  durationSec?: number;
  blockSec?: number;
  enabled?: boolean;
}

export const updatePolicyValidator = validate([
  param('name').isString().trim().notEmpty().withMessage('name is required'),
  body('points').optional().isInt({ min: 1 }).withMessage('points must be a positive integer'),
  body('durationSec').optional().isInt({ min: 1 }).withMessage('durationSec must be a positive integer'),
  body('blockSec').optional().isInt({ min: 0 }).withMessage('blockSec must be a non-negative integer'),
  body('enabled').optional().isBoolean().withMessage('enabled must be a boolean'),
]);
