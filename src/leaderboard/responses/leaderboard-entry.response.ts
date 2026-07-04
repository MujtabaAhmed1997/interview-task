import { LeaderboardEntry } from '../types/leaderboard-entry';

export class LeaderboardEntryResponse {
  rank: number;
  userId: string;
  userName: string;
  score: number;
  submittedAt: string;

  constructor(entry: LeaderboardEntry) {
    this.rank = entry.rank;
    this.userId = entry.userId;
    this.userName = entry.userName;
    this.score = entry.score;
    this.submittedAt = new Date(entry.submittedAt).toISOString();
  }
}
