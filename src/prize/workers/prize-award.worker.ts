import { Job, Worker } from 'bullmq';
import { QueueName } from '../../common/enums/queue-name.enum';
import { registerWorker } from '../../common/queues/queue.registry';
import { PrizeService } from '../services/prize.service';
import { AwardJobData } from '../types/award-job';

export const registerPrizeAwardWorker = (prizeService: PrizeService = new PrizeService()): Worker<AwardJobData> =>
  registerWorker<AwardJobData>(QueueName.PRIZE_AWARD, (job: Job<AwardJobData>) => prizeService.runAward(job.data.contestId));
