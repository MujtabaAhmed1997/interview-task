import { UserAwardView } from '../types/user-award-view';

export class UserPrizeResponse {
  contestId: string;
  contestName: string;
  prizeId: string;
  prizeTitle: string;
  rank: number;
  score: number;
  awardedAt: string;

  constructor(view: UserAwardView) {
    this.contestId = view.contestId;
    this.contestName = view.contestName;
    this.prizeId = view.prizeId;
    this.prizeTitle = view.prizeTitle;
    this.rank = view.rank;
    this.score = view.score;
    this.awardedAt = new Date(view.awardedAt).toISOString();
  }
}
