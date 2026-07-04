import { DTO } from '../../common/base/dto';

export class AwardDTO extends DTO {
  contestId!: string;
  userId!: string;
  prizeId!: string;
  score!: number;
  awardedAt!: Date;
}
