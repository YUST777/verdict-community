// This forces browsers to fetch fresh data instead of using cached responses
export const CACHE_VERSION = '1.5';

// Use this in API fetch calls to bust cache
export function getCacheBustParam(): string {
    return `_v=${CACHE_VERSION}`;
}

// Full cache-busted URL helper
export function addCacheBust(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_v=${CACHE_VERSION}`;
}
