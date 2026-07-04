import { OptionDTO } from '../dtos/option.dto';

export class OptionAdminResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;

  constructor(dto: OptionDTO) {
    this.id = dto.id;
    this.text = dto.text;
    this.isCorrect = dto.isCorrect;
    this.position = dto.position;
  }
}
