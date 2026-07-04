import Redis, { RedisOptions } from 'ioredis';
import { logger } from './logger';
import { secrets } from './secrets';

export const redisConnectionOptions: RedisOptions = {
  host: secrets.redis.host,
  port: secrets.redis.port,
  password: secrets.redis.password || undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true,
};

let client: Redis | null = null;

export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis(redisConnectionOptions);
    client.on('error', (error: Error) => logger.error({ event: 'redis.error', message: error.message }));
  }
  return client;
};

export const disconnectRedis = async (): Promise<void> => {
  if (client) {
    await client.quit();
    client = null;
  }
};
