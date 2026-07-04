import { QuestionDTO } from '../dtos/question.dto';
import { QuestionType } from '../enums/question-type.enum';
import { OptionAdminResponse } from './option-admin.response';

export class QuestionAdminResponse {
  id: string;
  contestId: string;
  type: QuestionType;
  text: string;
  points: number;
  position: number;
  options: OptionAdminResponse[];

  constructor(dto: QuestionDTO) {
    this.id = dto.id;
    this.contestId = dto.contestId;
    this.type = dto.type;
    this.text = dto.text;
    this.points = dto.points;
    this.position = dto.position;
    this.options = dto.options.map((option) => new OptionAdminResponse(option));
  }
}
