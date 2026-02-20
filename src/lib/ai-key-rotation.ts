/**
 * AI API Key Rotation System
 * Rotates between multiple free tier API keys to avoid rate limits
 * Serverless-friendly: Works on Vercel Edge/Serverless functions
 */

interface APIKey {
    key: string;
    name: string;
    requestsThisMinute: number;
    requestsToday: number;
    lastUsedAt: number;
    lastResetMinute: number;
    lastResetDay: number;
    isAvailable: boolean;
}

// Rate limits for free tier (conservative estimates)
const FREE_TIER_RPM = 15; // Requests per minute
const FREE_TIER_RPD = 1000; // Requests per day (generous estimate)

// In-memory cache (resets on serverless function restart - that's fine)
// For production, consider using Redis or database
let keyCache: Map<string, APIKey> | null = null;

// Track last request time per key to add spacing
const lastRequestTimePerKey = new Map<string, number>();
// Configurable spacing from environment (default: 4000ms = 4 seconds)
// 15 RPM = 4 seconds spacing per key
const MIN_REQUEST_SPACING_MS = parseInt(process.env.AI_KEY_SPACING_MS || '4000', 10);

function initializeKeys(): Map<string, APIKey> {
    if (keyCache) return keyCache;

    // Get keys from environment (comma-separated)
    const keysEnv = process.env.GEMINI_API_KEYS || '';
    const keyNamesEnv = process.env.GEMINI_API_KEY_NAMES || '';
    
    const keys = keysEnv.split(',').map(k => k.trim()).filter(Boolean);
    const names = keyNamesEnv.split(',').map(n => n.trim()).filter(Boolean);
    
    keyCache = new Map();
    const now = Date.now();
    const today = Math.floor(now / (1000 * 60 * 60 * 24));
    const currentMinute = Math.floor(now / (1000 * 60));

    keys.forEach((key, index) => {
        const name = names[index] || `key-${index + 1}`;
        keyCache!.set(key, {
            key,
            name,
            requestsThisMinute: 0,
            requestsToday: 0,
            lastUsedAt: 0,
            lastResetMinute: currentMinute,
            lastResetDay: today,
            isAvailable: true,
        });
    });

    return keyCache;
}

function resetCountersIfNeeded(key: APIKey): void {
    const now = Date.now();
    const today = Math.floor(now / (1000 * 60 * 60 * 24));
    const currentMinute = Math.floor(now / (1000 * 60));

    // Reset minute counter if new minute
    if (currentMinute !== key.lastResetMinute) {
        key.requestsThisMinute = 0;
        key.lastResetMinute = currentMinute;
    }

    // Reset day counter if new day
    if (today !== key.lastResetDay) {
        key.requestsToday = 0;
        key.lastResetDay = today;
    }
}

function isKeyAvailable(key: APIKey): boolean {
    resetCountersIfNeeded(key);
    
    return (
        key.isAvailable &&
        key.requestsThisMinute < FREE_TIER_RPM &&
        key.requestsToday < FREE_TIER_RPD
    );
}

/**
 * Get the best available API key using round-robin with availability check
 */
export function getAvailableAPIKey(): string | null {
    const keys = initializeKeys();
    
    if (keys.size === 0) {
        // Fallback to single key if no rotation configured
        return process.env.GEMINI_API_KEY || null;
    }

    // Convert to array and filter available keys
    const availableKeys = Array.from(keys.values()).filter(isKeyAvailable);
    
    if (availableKeys.length === 0) {
        // All keys exhausted, return null (caller should handle fallback)
        return null;
    }

    // Round-robin: Sort by lastUsedAt, use least recently used
    availableKeys.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
    
    const selectedKey = availableKeys[0];
    const now = Date.now();
    
    // Check if we need to wait before using this key (to avoid rate limits)
    const lastRequestTime = lastRequestTimePerKey.get(selectedKey.key) || 0;
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_SPACING_MS) {
        // This key was used recently, try to find another key
        const otherAvailableKeys = availableKeys.slice(1).filter(k => {
            const otherLastTime = lastRequestTimePerKey.get(k.key) || 0;
            return (now - otherLastTime) >= MIN_REQUEST_SPACING_MS;
        });
        
        if (otherAvailableKeys.length > 0) {
            // Use a different key that hasn't been used recently
            const alternativeKey = otherAvailableKeys[0];
            alternativeKey.requestsThisMinute++;
            alternativeKey.requestsToday++;
            alternativeKey.lastUsedAt = now;
            lastRequestTimePerKey.set(alternativeKey.key, now);
            return alternativeKey.key;
        }
        
        // All keys were used recently, but we'll use this one anyway
        // The throttling system will add a delay
    }
    
    // Update usage
    selectedKey.requestsThisMinute++;
    selectedKey.requestsToday++;
    selectedKey.lastUsedAt = now;
    lastRequestTimePerKey.set(selectedKey.key, now);
    
    return selectedKey.key;
}

/**
 * Mark a key as unavailable (e.g., after rate limit error)
 */
export function markKeyUnavailable(apiKey: string, reason?: string): void {
    const keys = initializeKeys();
    const key = keys.get(apiKey);
    
    if (key) {
        key.isAvailable = false;
        console.warn(`[Key Rotation] Marked key ${key.name} as unavailable: ${reason || 'Rate limit'}`);
        
        // Auto-recover after 5 minutes
        setTimeout(() => {
            if (key) {
                key.isAvailable = true;
                console.log(`[Key Rotation] Recovered key ${key.name}`);
            }
        }, 5 * 60 * 1000);
    }
}

/**
 * Get statistics about key usage
 */
export function getKeyStats(): Array<{
    name: string;
    requestsThisMinute: number;
    requestsToday: number;
    isAvailable: boolean;
}> {
    const keys = initializeKeys();
    return Array.from(keys.values()).map(key => {
        resetCountersIfNeeded(key);
        return {
            name: key.name,
            requestsThisMinute: key.requestsThisMinute,
            requestsToday: key.requestsToday,
            isAvailable: isKeyAvailable(key),
        };
    });
}

/**
 * Reset all key counters (for testing or manual reset)
 */
export function resetAllKeys(): void {
    keyCache = null;
    initializeKeys();
}
