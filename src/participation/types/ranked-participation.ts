export interface RankedParticipation {
  userId: string;
  userName: string;
  score: number;
  submittedAt: Date;
}

export interface TopParticipation {
  participationId: string;
  userId: string;
  score: number;
  submittedAt: Date;
}
