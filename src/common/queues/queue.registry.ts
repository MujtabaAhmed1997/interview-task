import { Job, Processor, Queue, Worker } from 'bullmq';
import { logger } from '../util/logger';
import { redisConnectionOptions } from '../util/redis';

const defaultJobOptions = {
  removeOnComplete: 100,
  removeOnFail: 500,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
};

const queues = new Map<string, Queue>();
const workers = new Map<string, Worker>();

export const getQueue = (name: string): Queue => {
  const existing = queues.get(name);
  if (existing) {
    return existing;
  }
  const queue = new Queue(name, { connection: redisConnectionOptions, defaultJobOptions });
  queues.set(name, queue);
  return queue;
};

export const registerWorker = <T>(name: string, processor: Processor<T>): Worker<T> => {
  const worker = new Worker<T>(name, processor, { connection: redisConnectionOptions, concurrency: 5 });
  worker.on('failed', (job: Job<T> | undefined, error: Error) => {
    logger.error({ event: 'queue.job.failed', queue: name, jobId: job?.id, message: error.message });
  });
  workers.set(name, worker);
  return worker;
};

export const closeQueues = async (): Promise<void> => {
  await Promise.all([...queues.values()].map((queue) => queue.close()));
  await Promise.all([...workers.values()].map((worker) => worker.close()));
  queues.clear();
  workers.clear();
};
