import { ApiError } from '../../common/errors/api.error';
import { QuestionErrorCode } from '../enums/question-error-code.enum';
import { QuestionType } from '../enums/question-type.enum';

interface OptionCorrectness {
  isCorrect: boolean;
}

const isValidOptionSet = (type: QuestionType, options: OptionCorrectness[]): boolean => {
  const total = options.length;
  const correct = options.filter((option) => option.isCorrect).length;
  if (type === QuestionType.SINGLE_SELECT) {
    return total >= 2 && correct === 1;
  }
  if (type === QuestionType.TRUE_FALSE) {
    return total === 2 && correct === 1;
  }
  return total >= 2 && correct >= 1;
};

export const assertValidOptionSet = (type: QuestionType, options: OptionCorrectness[]): void => {
  if (!isValidOptionSet(type, options)) {
    throw ApiError.badRequest(`Invalid option set for a ${type} question`, QuestionErrorCode.INVALID_OPTION_SET);
  }
};
