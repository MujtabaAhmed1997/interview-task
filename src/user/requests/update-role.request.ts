import { body } from 'express-validator';
import { UserRole } from '../../common/enums/user-role.enum';
import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export const updateRoleValidator = validate([idParam(), body('role').isIn(Object.values(UserRole))]);
