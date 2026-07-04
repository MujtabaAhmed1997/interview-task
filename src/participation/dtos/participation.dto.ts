import { DTO } from '../../common/base/dto';
import { ParticipationStatus } from '../enums/participation-status.enum';

export class ParticipationDTO extends DTO {
  contestId!: string;
  userId!: string;
  status!: ParticipationStatus;
  score!: number | null;
  startedAt!: Date;
  submittedAt!: Date | null;
}
