import { RankedParticipation } from '../../participation/types/ranked-participation';

export interface LeaderboardEntry extends RankedParticipation {
  rank: number;
}
