import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      lazyConnect: true, // ⚡ Don't connect automatically on instantiation
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });
    redisInstance.on('error', (err) => {
      console.error('Redis Error:', err);
    });
  }
  return redisInstance;
}

// Proxy behaves exactly like the Redis client but defers instantiation and connection until method execution
const redisProxy = new Proxy({} as Redis, {
  get(target, prop) {
    const instance = getRedis();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default redisProxy;

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const instance = getRedis();
    const data = await instance.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('Redis Get Error:', err);
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
  try {
    const instance = getRedis();
    await instance.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis Set Error:', err);
  }
}
