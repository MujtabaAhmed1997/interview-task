import { OptionDTO } from '../dtos/option.dto';

export class OptionParticipantResponse {
  id: string;
  text: string;
  position: number;

  constructor(dto: OptionDTO) {
    this.id = dto.id;
    this.text = dto.text;
    this.position = dto.position;
  }
}
