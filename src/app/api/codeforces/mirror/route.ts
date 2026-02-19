import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

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

    // 1. Try Cache
    try {
        const cacheResult = await query(
            `SELECT data, updated_at FROM mirror_problems WHERE contest_id = $1 AND problem_index = $2`,
            [contestId, problemId]
        );

        if (cacheResult.rows.length > 0) {
            const { data } = cacheResult.rows[0];
            // Async Log View
            logView(req, contestId, problemId).catch(e => console.error('Log error', e));
            return NextResponse.json(data);
        }
    } catch (e) {
        console.warn('[Mirror] Cache read failed (skipping):', e instanceof Error ? e.message : 'Unknown error');
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

    // Call the host mirror service (runs puppeteer outside Docker)
    const mirrorServiceUrl = process.env.MIRROR_SERVICE_URL || 'http://localhost:3099';

    try {
        const response = await fetch(`${mirrorServiceUrl}/fetch?url=${encodeURIComponent(targetUrl)}`, {
            signal: AbortSignal.timeout(60000)
        });

        if (!response.ok) {
            console.warn('[Mirror] Service failed or timed out. Switching to local fallback...');
            throw new Error('Service Unavailable');
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // Cache & Return
        await cacheAndLog(req, contestId, problemId, data);
        return NextResponse.json(data);

    } catch (error) {
        console.warn(`[Mirror] External service failed (${error instanceof Error ? error.message : 'Unknown'}). Attempting direct scrape...`);

        try {
            const fallbackData = await scrapeDirectly(targetUrl);
            if (fallbackData) {
                await cacheAndLog(req, contestId, problemId, fallbackData);
                return NextResponse.json(fallbackData);
            } else {
                return NextResponse.json({ error: 'Failed to scrape problem directly', detail: 'Parser could not find problem statement' }, { status: 500 });
            }
        } catch (fallbackError) {
            console.error('[Mirror] Direct scrape failed:', fallbackError);
            return NextResponse.json({
                error: 'Mirror service and fallback both failed',
                detail: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
            }, { status: 500 });
        }
    }
}

// --- Helper Functions ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cacheAndLog(req: NextRequest, contestId: string, problemId: string, data: any) {
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
    // Strategy 1: Try mirror.codeforces.com
    try {
        const mirrorUrl = url.replace('codeforces.com', 'mirror.codeforces.com');
        console.log(`[Mirror] Strategy 1: Scraping ${mirrorUrl}`);
        const data = await fetchAndParse(mirrorUrl);
        return data;
    } catch (e1) {
        console.warn(`[Mirror] Strategy 1 failed (${e1 instanceof Error ? e1.message : 'Unknown'}).`);
    }

    // Strategy 2: Try m.codeforces.com (Mobile Site)
    try {
        const mobileUrl = url.replace('https://codeforces.com', 'https://m.codeforces.com').replace('https://mirror.codeforces.com', 'https://m.codeforces.com');
        console.log(`[Mirror] Strategy 2: Scraping ${mobileUrl}`);
        const data = await fetchAndParse(mobileUrl);
        return data;
    } catch (e2) {
        console.warn(`[Mirror] Strategy 2 failed (${e2 instanceof Error ? e2.message : 'Unknown'}).`);
    }

    // Strategy 3: Graceful Mock (Final Resort)
    console.warn('[Mirror] All strategies failed. Returning graceful mock.');
    return {
        meta: {
            title: 'Problem Content Unavailable',
            timeLimitMs: 2000,
            memoryLimitMB: 256,
            sourceUrl: url
        },
        story: '<div class="alert alert-warning"><strong>Connection Error:</strong> We could not retrieve the problem statement from Codeforces at this time (likely due to bot protection).<br/><br/>You can still use the editor and test runner if you copy the test cases manually.</div>',
        inputSpec: 'See Codeforces link',
        outputSpec: 'See Codeforces link',
        testCases: [],
        note: 'Scraping failed. Click "View on Codeforces" to see original problem.'
    };
}

async function fetchAndParse(url: string) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://codeforces.com/'
        },
        redirect: 'follow'
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    if (html.includes('Redirecting to the completion of the challenge') || html.includes('Just a moment...')) {
        throw new Error('Cloudflare Challenge Detected');
    }

    // Regex Extractors
    const titleMatch = html.match(/<div class="title">([^<]+)<\/div>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Problem';

    const timeMatch = html.match(/time limit per test<\/div>([^<]+)<\/div>/);
    const memMatch = html.match(/memory limit per test<\/div>([^<]+)<\/div>/);
    const timeText = timeMatch ? timeMatch[1].trim() : '2 seconds';
    const memText = memMatch ? memMatch[1].trim() : '256 megabytes';
    const timeLimitMs = (parseFloat(timeText) || 2) * 1000;
    const memoryLimitMB = parseInt(memText) || 256;

    const headerEnd = html.indexOf('</div>', html.indexOf('<div class="header">') + 20) + 6;
    const inputStart = html.indexOf('<div class="input-specification">');
    let story = '';
    if (headerEnd > 6 && inputStart > headerEnd) {
        story = html.substring(headerEnd, inputStart).trim();
    } else {
        const statementMatch = html.match(/<div class="problem-statement">([\s\S]*?)<div class="input-specification">/);
        if (statementMatch) story = statementMatch[1];
    }

    const inputMatch = html.match(/<div class="input-specification">([\s\S]*?)<\/div>\s*<div class="output-specification">/);
    const outputMatch = html.match(/<div class="output-specification">([\s\S]*?)<\/div>\s*<div class="sample-tests">/);
    const inputSpec = inputMatch ? inputMatch[1].replace(/<div class="section-title">Input<\/div>/, '').trim() : '';
    const outputSpec = outputMatch ? outputMatch[1].replace(/<div class="section-title">Output<\/div>/, '').trim() : '';

    const testCases: { input: string; output: string }[] = [];
    const sampleRegex = /<div class="input">\s*<div class="title">Input<\/div>\s*<pre>([\s\S]*?)<\/pre>\s*<\/div>\s*<div class="output">\s*<div class="title">Output<\/div>\s*<pre>([\s\S]*?)<\/pre>\s*<\/div>/g;
    let match;
    while ((match = sampleRegex.exec(html)) !== null) {
        testCases.push({
            input: match[1].replace(/<br\s*\/?>/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim(),
            output: match[2].replace(/<br\s*\/?>/g, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim()
        });
    }

    const cleanStory = story
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
        .replace(/&nbsp;/g, ' ');

    return {
        meta: {
            title,
            timeLimitMs,
            memoryLimitMB,
            sourceUrl: url
        },
        story: cleanStory,
        inputSpec,
        outputSpec,
        testCases,
        note: ''
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
