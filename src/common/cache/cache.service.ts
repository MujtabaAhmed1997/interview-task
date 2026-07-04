import { getRedis } from '../util/redis';
import { secrets } from '../util/secrets';

export class CacheService {
  private readonly redis = getRedis();

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = secrets.cacheTtlSeconds): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async delByPrefix(prefix: string): Promise<void> {
    const stream = this.redis.scanStream({ match: `${prefix}*`, count: 100 });
    const pipeline = this.redis.pipeline();
    let hasKeys = false;
    for await (const batch of stream) {
      for (const key of batch as string[]) {
        pipeline.del(key);
        hasKeys = true;
      }
    }
    if (hasKeys) {
      await pipeline.exec();
    }
  }
}

export const cacheService = new CacheService();
