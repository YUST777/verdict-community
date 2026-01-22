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

    const { searchParams } = new URL(req.url); // Use req.url which is string
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
        // Table might not exist yet or connection error
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
    // The service runs on the host at port 3099
    // In production, set MIRROR_SERVICE_URL env variable
    const mirrorServiceUrl = process.env.MIRROR_SERVICE_URL || 'http://mirror.verdict.run';

    try {
        const response = await fetch(`${mirrorServiceUrl}/fetch?url=${encodeURIComponent(targetUrl)}`, {
            signal: AbortSignal.timeout(120000) // 2 minute timeout
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('[Mirror] Service error:', errData);
            return NextResponse.json({ error: 'Mirror service error', detail: errData.error || 'Unknown error' }, { status: 500 });
        }

        const data = await response.json();

        if (data.error) {
            console.error('[Mirror] Fetch error:', data.error);
            return NextResponse.json({ error: data.error, detail: data.detail }, { status: 500 });
        }

        // Save to Cache
        try {
            await query(
                `INSERT INTO mirror_problems (contest_id, problem_index, data, updated_at)
                 VALUES ($1, $2, $3, NOW())
                 ON CONFLICT (contest_id, problem_index) 
                 DO UPDATE SET data = $3, updated_at = NOW()`,
                [contestId, problemId, data]
            );
            } catch (dbErr) {
            console.error('[Mirror] Failed to cache:', dbErr instanceof Error ? dbErr.message : 'Unknown error');
        }

        // Async Log View
        logView(req, contestId, problemId).catch(e => console.error('Log error', e));

        return NextResponse.json(data);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Mirror fetch failed:', message);
        return NextResponse.json({ error: 'Failed to fetch from Codeforces Mirror', detail: message }, { status: 500 });
    }
}

async function logView(req: NextRequest, contestId: string, problemId: string) {
    try {
        const user = await verifyAuth(req);
        await query(
            `INSERT INTO mirror_views (contest_id, problem_index, user_id) VALUES ($1, $2, $3)`,
            [contestId, problemId, user?.id || null]
        );
    } catch (e) {
        // Silently fail logging to avoid impacting user experience
        console.error('[Mirror] Logging failed:', e instanceof Error ? e.message : 'Unknown error');
    }
}
