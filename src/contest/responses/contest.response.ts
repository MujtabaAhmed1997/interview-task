import { ContestDTO } from '../dtos/contest.dto';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';
import { ContestStatus } from '../enums/contest-status.enum';

export const deriveContestStatus = (startTime: Date | string, endTime: Date | string, now: Date = new Date()): ContestStatus => {
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();
  const nowMs = now.getTime();
  if (nowMs < startMs) {
    return ContestStatus.UPCOMING;
  }
  if (nowMs > endMs) {
    return ContestStatus.ENDED;
  }
  return ContestStatus.ACTIVE;
};

export class ContestResponse {
  id: string;
  name: string;
  description: string | null;
  accessLevel: ContestAccessLevel;
  status: ContestStatus;
  startTime: string;
  endTime: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(dto: ContestDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.description = dto.description;
    this.accessLevel = dto.accessLevel;
    this.status = deriveContestStatus(dto.startTime, dto.endTime);
    this.startTime = new Date(dto.startTime).toISOString();
    this.endTime = new Date(dto.endTime).toISOString();
    this.createdBy = dto.createdBy;
    this.createdAt = dto.createdAt;
    this.updatedAt = dto.updatedAt;
  }
}
