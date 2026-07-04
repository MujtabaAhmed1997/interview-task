import { QuestionDTO } from '../dtos/question.dto';
import { QuestionType } from '../enums/question-type.enum';
import { OptionParticipantResponse } from './option-participant.response';

export class QuestionParticipantResponse {
  id: string;
  contestId: string;
  type: QuestionType;
  text: string;
  points: number;
  position: number;
  options: OptionParticipantResponse[];

  constructor(dto: QuestionDTO) {
    this.id = dto.id;
    this.contestId = dto.contestId;
    this.type = dto.type;
    this.text = dto.text;
    this.points = dto.points;
    this.position = dto.position;
    this.options = dto.options.map((option) => new OptionParticipantResponse(option));
  }
}
