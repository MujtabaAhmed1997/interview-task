import { RateLimitStoreType } from '../enums/rate-limit-store-type.enum';
import { secrets } from '../util/secrets';
import { MemoryRateLimitStore } from './memory-rate-limit.store';
import { RateLimitStore } from './rate-limit.types';
import { RedisRateLimitStore } from './redis-rate-limit.store';

let store: RateLimitStore | null = null;

export const getRateLimitStore = (): RateLimitStore => {
  if (!store) {
    store = secrets.rateLimitStore === RateLimitStoreType.MEMORY ? new MemoryRateLimitStore() : new RedisRateLimitStore();
  }
  return store;
};
