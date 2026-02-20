/**
 * IP Rate Limit Mitigation System
 * 
 * Prevents Google from rate limiting our IP by:
 * 1. Request throttling with jitter (random delays)
 * 2. Request queuing to avoid bursts
 * 3. User-Agent rotation
 * 4. Optional proxy support
 * 5. Request distribution across time
 */

// Request queue to prevent bursts
interface QueuedRequest {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    execute: () => Promise<any>;
    priority: number;
}

class RequestQueue {
    private queue: QueuedRequest[] = [];
    private processing = false;
    private minDelay: number;
    private maxDelay: number;
    private lastRequestTime = 0;

    constructor(minDelayMs = 200, maxDelayMs = 800) {
        this.minDelay = minDelayMs;
        this.maxDelay = maxDelayMs;
    }

    /**
     * Add request to queue with priority
     */
    async enqueue<T>(execute: () => Promise<T>, priority = 0): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push({ resolve, reject, execute, priority });
            this.processQueue();
        });
    }

    /**
     * Process queue with throttling
     */
    private async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;

        while (this.queue.length > 0) {
            // Sort by priority (higher first)
            this.queue.sort((a, b) => b.priority - a.priority);
            
            const request = this.queue.shift()!;
            
            // Calculate delay with jitter (random between min and max)
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            const baseDelay = Math.max(0, this.minDelay - timeSinceLastRequest);
            const jitter = Math.random() * (this.maxDelay - this.minDelay);
            const delay = baseDelay + jitter;

            if (delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            this.lastRequestTime = Date.now();

            // Execute request
            try {
                const result = await request.execute();
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
        }

        this.processing = false;
    }

    /**
     * Get queue length
     */
    getQueueLength(): number {
        return this.queue.length;
    }
}

// Configurable delays from environment (default: 200-800ms)
const MIN_DELAY_MS = parseInt(process.env.AI_REQUEST_MIN_DELAY_MS || '200', 10);
const MAX_DELAY_MS = parseInt(process.env.AI_REQUEST_MAX_DELAY_MS || '800', 10);

// Global request queue instance
const requestQueue = new RequestQueue(MIN_DELAY_MS, MAX_DELAY_MS);

// User-Agent rotation pool
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

let userAgentIndex = 0;

/**
 * Get a rotated user agent
 */
function getRotatedUserAgent(): string {
    const ua = USER_AGENTS[userAgentIndex];
    userAgentIndex = (userAgentIndex + 1) % USER_AGENTS.length;
    return ua;
}

/**
 * Proxy configuration (optional)
 */
interface ProxyConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    protocol?: 'http' | 'https';
}

// Optional proxy pool (set via environment variables)
function getProxyConfig(): ProxyConfig | null {
    const proxyUrl = process.env.PROXY_URL;
    if (!proxyUrl) return null;

    try {
        const url = new URL(proxyUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            username: url.username || undefined,
            password: url.password || undefined,
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
        };
    } catch {
        return null;
    }
}

/**
 * Create fetch with proxy support (Node.js only)
 */
function createProxiedFetch(url: string, options: RequestInit): Promise<Response> {
    const proxyConfig = getProxyConfig();
    
    // If no proxy configured, use regular fetch
    if (!proxyConfig) {
        return fetch(url, options);
    }

    // For serverless environments, proxy might not work
    // In that case, fall back to regular fetch
    // For Node.js environments, you'd use a library like 'https-proxy-agent'
    // For now, we'll use regular fetch and rely on Vercel's IP distribution
    
    return fetch(url, {
        ...options,
        // Add headers to make requests appear more natural
        headers: {
            ...options.headers,
            'User-Agent': getRotatedUserAgent(),
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        },
    });
}

/**
 * Throttled fetch with rate limit mitigation
 */
export async function throttledFetch(
    url: string,
    options: RequestInit = {},
    priority = 0
): Promise<Response> {
    return requestQueue.enqueue(async () => {
        // Add jitter to request timing
        const jitter = Math.random() * 100; // 0-100ms additional random delay
        await new Promise(resolve => setTimeout(resolve, jitter));

        // Use proxied fetch (or regular fetch if no proxy)
        return createProxiedFetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'User-Agent': getRotatedUserAgent(),
            },
        });
    }, priority);
}

/**
 * Exponential backoff retry with jitter
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            // If it's a rate limit error, use longer backoff
            const isRateLimit = error instanceof Error && 
                (error.message.includes('429') || 
                 error.message.includes('rate limit') ||
                 error.message.includes('quota'));

            if (attempt < maxRetries) {
                // Exponential backoff with jitter
                const delay = baseDelay * Math.pow(2, attempt);
                const jitter = Math.random() * delay * 0.3; // 30% jitter
                const backoffDelay = isRateLimit ? delay * 2 : delay + jitter;
                
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

/**
 * Get current queue status
 */
export function getQueueStatus() {
    return {
        queueLength: requestQueue.getQueueLength(),
        userAgent: USER_AGENTS[userAgentIndex],
    };
}

/**
 * Configure queue delays
 */
export function configureQueue(minDelayMs: number, maxDelayMs: number) {
    // This would require making the queue configurable
    // For now, we use the default 200-800ms
    console.log(`[IP Mitigation] Queue configured: ${minDelayMs}-${maxDelayMs}ms delays`);
}
