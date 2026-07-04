import { PrizeDTO } from '../dtos/prize.dto';

export class PrizeResponse {
  id: string;
  contestId: string;
  rank: number;
  title: string;
  description: string | null;

  constructor(dto: PrizeDTO) {
    this.id = dto.id;
    this.contestId = dto.contestId;
    this.rank = dto.rank;
    this.title = dto.title;
    this.description = dto.description;
  }
}
