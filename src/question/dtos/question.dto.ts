import { DTO } from '../../common/base/dto';
import { QuestionType } from '../enums/question-type.enum';
import { OptionDTO } from './option.dto';

export class QuestionDTO extends DTO {
  contestId!: string;
  type!: QuestionType;
  text!: string;
  points!: number;
  position!: number;
  options!: OptionDTO[];
}
