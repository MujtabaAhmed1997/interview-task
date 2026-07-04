import { DTO } from '../../common/base/dto';
import { ContestAccessLevel } from '../enums/contest-access-level.enum';

export class ContestDTO extends DTO {
  name!: string;
  description!: string | null;
  accessLevel!: ContestAccessLevel;
  startTime!: Date;
  endTime!: Date;
  createdBy!: string;
}
