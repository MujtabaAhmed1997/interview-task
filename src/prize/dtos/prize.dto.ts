import { DTO } from '../../common/base/dto';

export class PrizeDTO extends DTO {
  contestId!: string;
  rank!: number;
  title!: string;
  description!: string | null;
}
