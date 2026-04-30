// Simple In-Memory Rate Limiter for lightweight protection
// Uses a Fixed Window counter strategy

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

// Global cache to persist across hot-reloads in dev
const globalRateLimit = global as unknown as { rateLimitMap: Map<string, RateLimitEntry> };
const rateLimitMap = globalRateLimit.rateLimitMap || new Map<string, RateLimitEntry>();
if (process.env.NODE_ENV !== 'production') globalRateLimit.rateLimitMap = rateLimitMap;

// Cleanup interval (every 5 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitMap.entries()) {
            if (now - entry.windowStart > 60000 * 5) {
                rateLimitMap.delete(key);
            }
        }
    }, 60000 * 5);
}

/**
 * Check if a request is within rate limits.
 * @param key Unique Identifier (e.g. IP Address)
 * @param limit Max requests
 * @param windowSeconds Window duration in seconds
 * @returns true if allowed, false if limited
 */
export function checkRateLimit(key: string, limit: number, windowSeconds: number): boolean {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let entry = rateLimitMap.get(key);

    if (!entry) {
        entry = { count: 0, windowStart: now };
        rateLimitMap.set(key, entry);
    }

    // Check window expiration
    if (now - entry.windowStart > windowMs) {
        entry.windowStart = now;
        entry.count = 0;
    }

    if (entry.count >= limit) {
        return false;
    }

    entry.count++;
    return true;
}
