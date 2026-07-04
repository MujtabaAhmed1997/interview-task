import { ParticipationDTO } from '../dtos/participation.dto';
import { ParticipationStatus } from '../enums/participation-status.enum';

export class ParticipationResponse {
  id: string;
  contestId: string;
  userId: string;
  status: ParticipationStatus;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;

  constructor(dto: ParticipationDTO) {
    this.id = dto.id;
    this.contestId = dto.contestId;
    this.userId = dto.userId;
    this.status = dto.status;
    this.score = dto.score;
    this.startedAt = dto.startedAt;
    this.submittedAt = dto.submittedAt;
  }
}
