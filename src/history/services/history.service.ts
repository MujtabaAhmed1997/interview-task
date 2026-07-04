import { PaginatedResult, PaginationParams } from '../../common/base/pagination';
import { ParticipationDTO } from '../../participation/dtos/participation.dto';
import { ParticipationStatus } from '../../participation/enums/participation-status.enum';
import { ParticipationService } from '../../participation/services/participation.service';
import { PrizeService } from '../../prize/services/prize.service';
import { UserAwardView } from '../../prize/types/user-award-view';

export class HistoryService {
  private readonly participationService: ParticipationService;
  private readonly prizeService: PrizeService;

  constructor(participationService: ParticipationService = new ParticipationService(), prizeService: PrizeService = new PrizeService()) {
    this.participationService = participationService;
    this.prizeService = prizeService;
  }

  async listContests(userId: string, params: PaginationParams, status?: ParticipationStatus): Promise<PaginatedResult<ParticipationDTO>> {
    return this.participationService.listByUser(userId, params, status);
  }

  async listPrizes(userId: string, params: PaginationParams): Promise<PaginatedResult<UserAwardView>> {
    return this.prizeService.listUserPrizes(userId, params);
  }
}
