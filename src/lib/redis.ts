import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

export default redis;

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('Redis Get Error:', err);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis Set Error:', err);
  }
}
