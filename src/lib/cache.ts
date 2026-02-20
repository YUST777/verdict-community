/**
 * Simple cache utility - passthrough implementation
 * This file is kept for API compatibility.
 */

/**
 * Get data or call callback if not cached.
 * This is a passthrough - always calls callback (no caching)
 */
export async function getOrSetCache<T>(
    _key: string,
    callback: () => Promise<T>,
    _ttlSeconds: number = 60
): Promise<T> {
    return callback();
}

/**
 * Invalidate cache by pattern - no-op since caching is disabled
 */
export async function invalidateCache(_pattern: string): Promise<void> {
    // No-op - Redis caching removed
}
