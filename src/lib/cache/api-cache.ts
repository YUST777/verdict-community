/**
 * Simple client-side cache to prevent redundant API calls during the same session.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();
const MAX_CACHE_SIZE = 100;

export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  ttlSeconds: number = 60
): Promise<T> {
  const cacheKey = `${options.method || 'GET'}:${url}`;
  const now = Date.now();

  const entry = memoryCache.get(cacheKey);
  if (entry && now < entry.expiry) {
    return entry.data;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (memoryCache.size >= MAX_CACHE_SIZE) {
        const firstKey = memoryCache.keys().next().value;
        if (firstKey) memoryCache.delete(firstKey);
      }

      memoryCache.set(cacheKey, {
        data,
        timestamp: now,
        expiry: now + ttlSeconds * 1000,
      });

      return data;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export function clearApiCache() {
  memoryCache.clear();
  pendingRequests.clear();
}

export function invalidatePath(url: string, method: string = 'GET') {
  memoryCache.delete(`${method}:${url}`);
}
