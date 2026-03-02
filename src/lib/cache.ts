import Redis from 'ioredis';

// Singleton Redis connection
let redis: Redis | null = null;
let connectionFailed = false;

function getRedis(): Redis | null {
    if (connectionFailed) return null;
    if (redis) return redis;

    try {
        redis = new Redis({
            host: process.env.REDIS_HOST || 'verdict-redis',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
                if (times > 3) {
                    connectionFailed = true;
                    return null;
                }
                return Math.min(times * 200, 1000);
            },
            lazyConnect: true,
            connectTimeout: 3000,
            commandTimeout: 3000,
        });

        redis.on('error', (err) => {
            console.error('[Redis] Connection error:', err.message);
        });

        redis.connect().catch(() => {
            connectionFailed = true;
            redis = null;
        });

        return redis;
    } catch {
        connectionFailed = true;
        return null;
    }
}

/**
 * Get cached data or call callback and cache the result.
 * Falls back to direct callback if Redis is unavailable.
 */
export async function getOrSetCache<T>(
    key: string,
    callback: () => Promise<T>,
    ttlSeconds: number = 60
): Promise<T> {
    const client = getRedis();

    if (client) {
        try {
            const cached = await client.get(key);
            if (cached) {
                return JSON.parse(cached) as T;
            }
        } catch {
            // Redis read failed, fall through to callback
        }
    }

    const result = await callback();

    if (client) {
        try {
            await client.setex(key, ttlSeconds, JSON.stringify(result));
        } catch {
            // Redis write failed, result still returned
        }
    }

    return result;
}

/**
 * Invalidate cache entries by exact key or glob pattern.
 */
export async function invalidateCache(pattern: string): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
        if (pattern.includes('*')) {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(...keys);
            }
        } else {
            await client.del(pattern);
        }
    } catch {
        // Silently fail
    }
}


/**
 * Pure read from Redis cache. Returns null if not found or Redis unavailable.
 */
export async function getCache<T>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;
    try {
        const cached = await client.get(key);
        if (cached) return JSON.parse(cached) as T;
    } catch {
        // Redis read failed
    }
    return null;
}

/**
 * Fire-and-forget write to Redis cache.
 */
export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
        await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
        // Redis write failed
    }
}
