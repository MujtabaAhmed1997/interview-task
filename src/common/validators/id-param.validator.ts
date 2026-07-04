import { param, ValidationChain } from 'express-validator';

export const idParam = (name = 'id'): ValidationChain => param(name).isUUID().withMessage(`${name} must be a valid UUID`);
