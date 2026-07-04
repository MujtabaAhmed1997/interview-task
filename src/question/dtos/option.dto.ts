import { DTO } from '../../common/base/dto';

export class OptionDTO extends DTO {
  questionId!: string;
  text!: string;
  isCorrect!: boolean;
  position!: number;
}
