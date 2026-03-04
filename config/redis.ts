import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/** better-auth secondaryStorage adapter backed by Upstash Redis */
export function redisSecondaryStorage() {
  const client = getRedis();

  return {
    async get(key: string): Promise<string | null> {
      return client.get<string>(key);
    },
    async set(key: string, value: string, ttl?: number): Promise<void> {
      if (ttl) {
        await client.set(key, value, { ex: ttl });
      } else {
        await client.set(key, value);
      }
    },
    async delete(key: string): Promise<void> {
      await client.del(key);
    },
  };
}
