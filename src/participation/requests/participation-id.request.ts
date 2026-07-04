import { validate } from '../../common/middlewares/validation.middleware';
import { idParam } from '../../common/validators/id-param.validator';

export const participationIdValidator = validate([idParam()]);
