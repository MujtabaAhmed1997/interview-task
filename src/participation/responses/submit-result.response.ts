import { ParticipationDTO } from '../dtos/participation.dto';
import { ParticipationStatus } from '../enums/participation-status.enum';

export class SubmitResultResponse {
  participationId: string;
  status: ParticipationStatus;
  score: number;

  constructor(dto: ParticipationDTO) {
    this.participationId = dto.id;
    this.status = dto.status;
    this.score = dto.score ?? 0;
  }
}
