import '@/lib/polyfill';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { getCache, setCache, invalidateCache } from '@/lib/cache';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    // Strict Rate Limit for Scraping: 20 per minute
    if (!checkRateLimit(`mirror:${ip}`, 20, 60)) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const problemId = searchParams.get('problemId');
    const urlType = searchParams.get('type') || 'contest';
    const groupId = searchParams.get('groupId');

    if (!contestId || !problemId) {
        console.warn(`[Mirror] Missing params: contestId=${contestId}, problemId=${problemId}, url=${req.url}`);
        return NextResponse.json({ error: 'Missing contestId or problemId' }, { status: 400 });
    }

    const noCache = searchParams.get('noCache') === 'true';

    const redisCacheKey = `cf:mirror:${contestId}-${problemId}`;

    // If noCache requested, invalidate Redis too
    if (noCache) {
        invalidateCache(redisCacheKey).catch(() => {});
    }

    // 0. Try Redis L1 cache (fast, in-memory)
    if (!noCache) {
        try {
            const redisCached = await getCache<MirrorProblemData>(redisCacheKey);
            if (redisCached) {
                const title = redisCached?.meta?.title || '';
                if (!title.includes('Bot Protection') && !title.includes('Unavailable')) {
                    console.log('[Mirror] Redis L1 cache hit');
                    logView(req, contestId, problemId).catch(e => console.error('Log error', e));
                    return NextResponse.json(redisCached);
                }
            }
        } catch {
            // Redis unavailable, fall through
        }
    }

    // 1. Try PostgreSQL L2 cache (skip if noCache or cached data was a bot-protection mock)
    if (!noCache) {
        try {
            const cacheResult = await query(
                `SELECT data, updated_at FROM mirror_problems WHERE contest_id = $1 AND problem_index = $2`,
                [contestId, problemId]
            );

            if (cacheResult.rows.length > 0) {
                const { data } = cacheResult.rows[0];
                // Don't serve stale bot-protection mocks from cache
                const title = (data as { meta?: { title?: string } })?.meta?.title || '';
                if (title.includes('Bot Protection') || title.includes('Unavailable')) {
                    console.log('[Mirror] Cached mock detected — forcing fresh fetch');
                } else {
                    // Populate Redis L1 from PostgreSQL hit
                    setCache(redisCacheKey, data, 3600).catch(() => {});
                    logView(req, contestId, problemId).catch(e => console.error('Log error', e));
                    return NextResponse.json(data);
                }
            }
        } catch (e) {
            console.warn('[Mirror] Cache read failed (skipping):', e instanceof Error ? e.message : 'Unknown error');
        }
    }

    // Build the correct URL based on type
    let targetUrl: string;
    switch (urlType) {
        case 'gym':
            targetUrl = `https://codeforces.com/gym/${contestId}/problem/${problemId}`;
            break;
        case 'problemset':
            targetUrl = `https://codeforces.com/problemset/problem/${contestId}/${problemId}`;
            break;
        case 'acmsguru':
            targetUrl = `https://codeforces.com/problemsets/acmsguru/problem/99999/${problemId}`;
            break;
        case 'group':
            if (!groupId) {
                return NextResponse.json({ error: 'Missing groupId for group problem' }, { status: 400 });
            }
            targetUrl = `https://codeforces.com/group/${groupId}/contest/${contestId}/problem/${problemId}`;
            break;
        case 'contest':
        default:
            targetUrl = `https://codeforces.com/contest/${contestId}/problem/${problemId}`;
            break;
    }

    // Race mirror service vs Wayback — return as soon as EITHER succeeds.
    // Wayback fetches archived CF pages in ~2s without going through CloudFlare.
    // Mirror gets a short 10s window in case CF unblocks in future.
    const mirrorServiceUrl = process.env.MIRROR_SERVICE_URL || 'http://localhost:3099';

    const mirrorPromise: Promise<MirrorProblemData> = (async () => {
        const resp = await fetch(`${mirrorServiceUrl}/fetch?url=${encodeURIComponent(targetUrl)}`, {
            signal: AbortSignal.timeout(10000)
        });
        if (!resp.ok) throw new Error(`Mirror HTTP ${resp.status}`);
        const d = await resp.json();
        if (d.error) throw new Error(d.error);
        console.log('[Mirror] Mirror service succeeded');
        return d;
    })();

    const waybackPromise: Promise<MirrorProblemData> = (async () => {
        const d = await scrapeDirectly(targetUrl);
        if (!d) throw new Error('Wayback: all timestamps failed');
        console.log('[Mirror] Wayback Machine succeeded');
        return d;
    })();

    // firstSuccess: resolves with the first non-rejected promise
    const firstSuccess = Promise.any([mirrorPromise, waybackPromise]);

    let data: MirrorProblemData | null = null;
    try {
        data = await firstSuccess;
    } catch {
        console.error('[Mirror] Both mirror and Wayback failed');
    }

    if (data) {
        const title = (data?.meta?.title as string) || '';
        if (!title.includes('Bot Protection') && !title.includes('Unavailable')) {
            setCache(redisCacheKey, data, 3600).catch(() => {}); // Redis L1
            cacheAndLog(req, contestId, problemId, data).catch(() => {}); // PostgreSQL L2
        }
        return NextResponse.json(data);
    }

    // Complete fallback — return graceful mock
    return NextResponse.json(await buildMock(targetUrl));

}


// --- Helper Functions ---

interface MirrorProblemData {
    meta?: { title?: string; timeLimitMs?: number; memoryLimitMB?: number; sourceUrl?: string };
    story?: string;
    inputSpec?: string;
    outputSpec?: string;
    note?: string;
    testCases?: unknown[];
}

async function cacheAndLog(req: NextRequest, contestId: string, problemId: string, data: MirrorProblemData) {
    try {
        await query(
            `INSERT INTO mirror_problems (contest_id, problem_index, data, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (contest_id, problem_index) 
             DO UPDATE SET data = $3, updated_at = NOW()`,
            [contestId, problemId, data]
        );

        logView(req, contestId, problemId).catch(() => { });
    } catch (e) {
        console.error('[Mirror] Cache/Log failed:', e);
    }
}

async function scrapeDirectly(url: string) {
    // Strategy 1: Fetch from Wayback Machine (archive.org) — bypasses Cloudflare IP blocks
    try {
        console.log('[Mirror] Strategy: Wayback Machine fetch for', url);
        const data = await fetchViaWayback(url);
        if (data) return data;
    } catch (e) {
        console.warn('[Mirror] Wayback Machine failed:', e instanceof Error ? e.message : 'Unknown');
    }

    // Strategy 2: mirror.codeforces.com subdomain
    try {
        const mirrorUrl = url.replace('https://codeforces.com', 'https://mirror.codeforces.com');
        console.log('[Mirror] Strategy: mirror subdomain', mirrorUrl);
        const data = await fetchAndParse(mirrorUrl);
        if (data) return data;
    } catch (e) {
        console.warn('[Mirror] mirror subdomain failed:', e instanceof Error ? e.message : 'Unknown');
    }

    return null; // All strategies exhausted
}

async function buildMock(url: string) {
    return {
        meta: {
            title: 'Problem Unavailable (Bot Protection)',
            timeLimitMs: 2000,
            memoryLimitMB: 256,
            sourceUrl: url
        },
        story: `
            <div class="alert alert-warning" style="background: rgba(255, 166, 0, 0.1); border: 1px solid rgba(255, 166, 0, 0.3); padding: 16px; border-radius: 8px; color: #ffca28; margin-bottom: 24px;">
                <h3 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    Connection Error
                </h3>
                <p>We could not retrieve the problem statement from Codeforces at this time.</p>
                <p style="margin-bottom: 0;"><strong>You can still solve this problem:</strong></p>
                <ol style="margin-top: 8px; padding-left: 20px;">
                    <li>Open the problem on Codeforces manually.</li>
                    <li>Copy test cases from the original problem.</li>
                    <li>Write your solution and test it here.</li>
                </ol>
            </div>
            <p>Please try refreshing the page in a few minutes.</p>
        `,
        inputSpec: '<p>Please refer to the original problem statement on Codeforces for input specifications.</p>',
        outputSpec: '<p>Please refer to the original problem statement on Codeforces for output specifications.</p>',
        testCases: [],
        note: `Codeforces URL: <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #10B981; text-decoration: underline;">${url}</a>`
    };
}


async function fetchViaWayback(url: string) {
    // Use a fixed timestamp that reliably works — skip CDX which can be slow
    // The Wayback Machine serves archived CF pages without Cloudflare interference
    const knownTimestamps = ['20260101120000', '20251201120000', '20251001120000', '20250601120000'];

    for (const timestamp of knownTimestamps) {
        try {
            const waybackUrl = `https://web.archive.org/web/${timestamp}/${url}`;
            console.log('[Mirror] Fetching archived snapshot:', waybackUrl);
            const data = await fetchAndParse(waybackUrl);
            if (data) return data;
        } catch (e) {
            console.warn('[Mirror] Wayback timestamp failed:', e instanceof Error ? e.message : 'Unknown');
        }
    }

    return null;
}


async function fetchAndParse(url: string) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        },
        next: { revalidate: 0 } // No Next.js cache
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // Check for explicit Cloudflare headers or content
    const html = await res.text();
    if (html.includes('Just a moment...') || html.includes('cf-browser-verification') || html.includes('cf-mitigated')) {
        throw new Error('Cloudflare Blocked');
    }

    const $ = cheerio.load(html);
    const statement = $('.problem-statement');

    if (!statement.length) throw new Error('No problem statement found');

    // Sanitization
    $('.MathJax_Preview').remove();
    $('.MathJax').remove();
    $('.MathJax_Display').remove();
    $('script').remove(); // Cheerio removes script tags easily

    // Images
    $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.startsWith('http')) {
            $(el).attr('src', `https://codeforces.com${src.startsWith('/') ? '' : '/'}${src}`);
        }
        $(el).css('max-width', '100%');
    });

    const header = statement.find('.header');
    const title = header.find('.title').text().trim() || 'Unknown';
    const timeLimit = header.find('.time-limit').contents().last().text().trim();
    const memoryLimit = header.find('.memory-limit').contents().last().text().trim();

    const timeLimitMs = (parseFloat(timeLimit) || 2) * 1000;
    const memoryLimitMB = parseInt(memoryLimit) || 256;

    // Story
    let story = '';
    let curr = header.next();
    while (curr.length && !curr.hasClass('input-specification') && !curr.hasClass('output-specification')) {
        story += $.html(curr);
        curr = curr.next();
    }

    const extract = (sel: string) => {
        const el = statement.find(sel).clone();
        el.find('.section-title').remove();
        return el.html()?.trim() || '';
    };

    // Test Cases
    const testCases: { id: number; input: string; output: string }[] = [];
    const inputs = statement.find('.sample-test .input pre');
    const outputs = statement.find('.sample-test .output pre');

    inputs.each((i, el) => {
        const clean = (e: cheerio.Element) => $(e).html()?.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '') || '';
        const input = clean(el);
        const output = clean(outputs.eq(i));
        testCases.push({ id: i + 1, input: input.trim(), output: output.trim() });
    });

    return {
        meta: {
            title,
            timeLimitMs,
            memoryLimitMB,
            sourceUrl: url
        },
        story,
        inputSpec: extract('.input-specification'),
        outputSpec: extract('.output-specification'),
        note: extract('.note'),
        testCases
    };
}

async function logView(req: NextRequest, contestId: string, problemId: string) {
    try {
        const user = await verifyAuth(req);
        await query(
            `INSERT INTO mirror_views (contest_id, problem_index, user_id) VALUES ($1, $2, $3)`,
            [contestId, problemId, user?.id || null]
        );
    } catch (e) {
        console.error('[Mirror] Logging failed:', e instanceof Error ? e.message : 'Unknown error');
    }
}
