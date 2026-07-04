import { ParticipationDTO } from '../../participation/dtos/participation.dto';
import { ParticipationStatus } from '../../participation/enums/participation-status.enum';

export class ContestHistoryResponse {
  participationId: string;
  contestId: string;
  status: ParticipationStatus;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;

  constructor(dto: ParticipationDTO) {
    this.participationId = dto.id;
    this.contestId = dto.contestId;
    this.status = dto.status;
    this.score = dto.score;
    this.startedAt = new Date(dto.startedAt).toISOString();
    this.submittedAt = dto.submittedAt ? new Date(dto.submittedAt).toISOString() : null;
  }
}
