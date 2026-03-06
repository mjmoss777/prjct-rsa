import { getRedis } from '@/config/redis';

/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * Returns { allowed, remaining, resetInSeconds }.
 */
export async function rateLimit(
  key: string,
  opts: { max: number; windowSeconds: number },
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
  const redis = getRedis();
  const redisKey = `rl:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - opts.windowSeconds;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(redisKey, 0, windowStart);
  pipe.zadd(redisKey, { score: now, member: `${now}:${Math.random().toString(36).slice(2, 8)}` });
  pipe.zcard(redisKey);
  pipe.expire(redisKey, opts.windowSeconds);

  const results = await pipe.exec();
  const count = (results[2] as number) ?? 0;

  return {
    allowed: count <= opts.max,
    remaining: Math.max(0, opts.max - count),
    resetInSeconds: opts.windowSeconds,
  };
}
