import { getRedis } from '@/config/redis';

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60; // 1 minute
const LOCKOUT_SECONDS = 6 * 60 * 60; // 6 hours

/**
 * Check if an IP is currently locked out.
 * Returns remaining lockout seconds, or 0 if not locked.
 */
export async function isLockedOut(ip: string): Promise<number> {
  const redis = getRedis();
  const ttl = await redis.ttl(`auth:lockout:${ip}`);
  return ttl > 0 ? ttl : 0;
}

/**
 * Record a failed auth attempt for an IP.
 * Returns true if the IP is now locked out.
 */
export async function recordFailedAttempt(ip: string): Promise<boolean> {
  const redis = getRedis();
  const key = `auth:fail:${ip}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  if (count >= MAX_ATTEMPTS) {
    await redis.set(`auth:lockout:${ip}`, '1', { ex: LOCKOUT_SECONDS });
    await redis.del(key);
    return true;
  }

  return false;
}

/**
 * Clear failed attempts on successful auth.
 */
export async function clearFailedAttempts(ip: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`auth:fail:${ip}`);
}
