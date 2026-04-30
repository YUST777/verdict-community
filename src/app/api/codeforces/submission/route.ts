import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import crypto from 'crypto';

const API_KEY = process.env.CF_API_KEY;
const API_SECRET = process.env.CF_API_SECRET;
const BRIDGE_URL = process.env.SCRAPLING_BRIDGE_URL || 'http://verdict-scrapling-bridge:8787';

// ── Server-side status cache ────────────────────────────────────────
// Prevents hammering CF when frontend polls every 2-3s
// Key: "contestId:submissionId" → { data, ts }
const statusCache = new Map<string, { data: Record<string, unknown>; ts: number }>();
const CF_API_CACHE = new Map<string, { data: Record<string, unknown>; ts: number }>();

// Cache TTL: 2s for non-final, 60s for final verdicts
const CACHE_TTL_PENDING = 2000;
const CACHE_TTL_FINAL = 60000;

// CF public API rate limiter: 1 req per 2s globally
let lastCfApiCall = 0;
const CF_API_MIN_INTERVAL = 2100; // 2.1s to be safe

function isFinalVerdict(verdict: string | null): boolean {
    if (!verdict) return false;
    const v = verdict.toUpperCase();
    return !['TESTING', 'RUNNING', ''].includes(v) &&
           !v.includes('QUEUE') && !v.includes('WAITING');
}

async function cfApiCall(method: string, params: Record<string, unknown>) {
    if (!API_KEY || !API_SECRET) return { status: 'FAILED', comment: 'Keys not configured' };

    const time = Math.floor(Date.now() / 1000);
    const rand = Math.random().toString(36).substring(2, 8);

    const allParams: Record<string, unknown> = { ...params, apiKey: API_KEY, time };
    const sortedKeys = Object.keys(allParams).sort();
    const queryStr = sortedKeys.map(k => `${k}=${allParams[k]}`).join('&');

    const signatureBase = `${rand}/${method}?${queryStr}#${API_SECRET}`;
    const hash = crypto.createHash('sha512').update(signatureBase).digest('hex');
    const apiSig = rand + hash;

    const url = `https://codeforces.com/api/${method}?${queryStr}&apiSig=${apiSig}`;

    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e: unknown) {
        return { status: 'FAILED', comment: e instanceof Error ? e.message : 'Unknown error' };
    }
}

async function cfPublicApiCall(method: string, params: Record<string, string> = {}) {
    // Rate limit: CF allows 1 API call per 2 seconds
    const now = Date.now();
    if (now - lastCfApiCall < CF_API_MIN_INTERVAL) {
        // Check if we have a cached response for this exact call
        const cacheKey = `api:${method}:${JSON.stringify(params)}`;
        const cached = CF_API_CACHE.get(cacheKey);
        if (cached && now - cached.ts < CF_API_MIN_INTERVAL) {
            return cached.data;
        }
        return { status: 'FAILED', comment: 'Rate limited (internal)' };
    }
    lastCfApiCall = now;

    const queryStr = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const url = `https://codeforces.com/api/${method}?${queryStr}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        // Cache the API response
        const cacheKey = `api:${method}:${JSON.stringify(params)}`;
        CF_API_CACHE.set(cacheKey, { data, ts: now });
        return data;
    } catch (e: unknown) {
        return { status: 'FAILED', comment: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Clean up old cache entries periodically
function cleanupCache() {
    const now = Date.now();
    for (const [key, val] of statusCache) {
        if (now - val.ts > CACHE_TTL_FINAL) statusCache.delete(key);
    }
    for (const [key, val] of CF_API_CACHE) {
        if (now - val.ts > 10000) CF_API_CACHE.delete(key);
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const submissionId = searchParams.get('submissionId');
    const handle = searchParams.get('handle');
    const cookies = searchParams.get('cookies');
    const urlType = searchParams.get('urlType') || 'contest';
    const groupId = searchParams.get('groupId');

    if (!contestId || !submissionId) {
        return NextResponse.json({ error: 'Missing contestId or submissionId' }, { status: 400 });
    }

    const user = await verifyAuth(req);
    const rateLimitKey = user ? `cf_status_view:${user.id}` : `cf_status_view:${req.headers.get('x-forwarded-for') || 'anon'}`;
    if (!checkRateLimit(rateLimitKey, 120, 60)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // ── Check server-side cache first ────────────────────────────────
    const cacheKey = `${contestId}:${submissionId}`;
    const cached = statusCache.get(cacheKey);
    if (cached) {
        const age = Date.now() - cached.ts;
        const ttl = isFinalVerdict(cached.data.verdict as string | null) ? CACHE_TTL_FINAL : CACHE_TTL_PENDING;
        if (age < ttl) {
            return NextResponse.json(cached.data);
        }
    }

    cleanupCache();

    try {
        const isRestricted = urlType === 'group' || urlType === 'gym';

        // ── 1. For restricted contests (Group/Gym), bridge is the only option ──
        if (isRestricted && cookies) {
            const bridgeResult = await fetchFromBridge(submissionId, contestId, cookies, urlType, groupId);
            if (bridgeResult) {
                statusCache.set(cacheKey, { data: bridgeResult, ts: Date.now() });
                return NextResponse.json(bridgeResult);
            }
        }

        // ── 2. Try CF public API first (no scraping, no IP risk) ──
        if (handle) {
            const result = await cfPublicApiCall('user.status', { handle, from: '1', count: '15' });
            if (result.status === 'OK' && result.result) {
                const sub = result.result.find((s: Record<string, unknown>) => s.id === parseInt(submissionId));
                if (sub) {
                    const response = {
                        success: true,
                        verdict: sub.verdict || null,
                        testNumber: sub.passedTestCount,
                        time: sub.timeConsumedMillis,
                        memory: Math.round((sub.memoryConsumedBytes as number) / 1024),
                        waiting: !sub.verdict || sub.verdict === 'TESTING'
                    };
                    statusCache.set(cacheKey, { data: response, ts: Date.now() });
                    return NextResponse.json(response);
                }
            }
        }

        // ── 3. Try authenticated API if keys are configured ──
        if (API_KEY && API_SECRET) {
            const result = await cfApiCall('contest.status', { contestId, from: 1, count: 15 });
            if (result.status === 'OK' && result.result) {
                const sub = result.result.find((s: Record<string, unknown>) => s.id === parseInt(submissionId));
                if (sub) {
                    const response = {
                        success: true,
                        verdict: sub.verdict || null,
                        testNumber: sub.passedTestCount,
                        time: sub.timeConsumedMillis,
                        memory: Math.round((sub.memoryConsumedBytes as number) / 1024),
                        waiting: !sub.verdict || sub.verdict === 'TESTING'
                    };
                    statusCache.set(cacheKey, { data: response, ts: Date.now() });
                    return NextResponse.json(response);
                }
            }
        }

        // ── 4. Last resort: bridge scraping (only if API failed) ──
        if (!isRestricted && cookies) {
            const bridgeResult = await fetchFromBridge(submissionId, contestId, cookies, urlType, groupId);
            if (bridgeResult) {
                statusCache.set(cacheKey, { data: bridgeResult, ts: Date.now() });
                return NextResponse.json(bridgeResult);
            }
        }

        return NextResponse.json({
            success: true,
            waiting: true,
            verdict: null,
            message: 'Submission still propagating or not found'
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[CF Submission Status] Error:', msg);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function fetchFromBridge(
    submissionId: string, contestId: string, cookies: string,
    urlType: string, groupId: string | null
): Promise<Record<string, unknown> | null> {
    try {
        const bridgeRes = await fetch(`${BRIDGE_URL}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId, contestId, cookies, urlType, groupId })
        });

        if (bridgeRes.ok) {
            const d = await bridgeRes.json();
            if (d.success && d.verdict) {
                return {
                    success: true,
                    verdict: d.verdict,
                    testNumber: d.testNumber || 0,
                    time: d.time || 0,
                    memory: d.memory || 0,
                    compilationError: d.compilationError || null,
                    details: d.details || null,
                    waiting: !d.verdict ||
                             ['queue', 'testing'].some((s: string) => d.verdict.toLowerCase().includes(s))
                };
            }
        }
    } catch (err: unknown) {
        console.warn('[Bridge Status] Error:', err instanceof Error ? err.message : err);
    }
    return null;
}
