import { validate } from '../../common/middlewares/validation.middleware';
import { listQueryValidators } from '../../common/validators/list-query';

export const listUsersValidator = validate(listQueryValidators());
