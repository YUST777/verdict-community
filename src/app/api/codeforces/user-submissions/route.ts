import { NextRequest, NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export async function GET(req: NextRequest) {
    // Rate limit user submission requests
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`cf-user-subs:${ip}`, 15, 60)) {
        return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const handle = searchParams.get('handle');
    const contestId = searchParams.get('contestId');
    const problemIndex = searchParams.get('problemIndex');

    if (!handle) {
        return NextResponse.json({ success: false, error: 'Missing handle' }, { status: 400 });
    }

    try {
        // Fetch user's submissions with Redis caching (60s TTL)
        const cacheKey = `cf:user-subs:${handle.toLowerCase()}`;
        const allSubmissions = await getOrSetCache(cacheKey, async () => {
            const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'verdict.run/1.0' },
                signal: AbortSignal.timeout(15000),
            });

            if (!res.ok) {
                if (res.status === 400) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.comment || 'Invalid handle or Codeforces API error');
                }
                throw new Error(`Codeforces API returned ${res.status}`);
            }

            const data = await res.json();
            if (data.status !== 'OK') {
                throw new Error(data.comment || 'Codeforces API error');
            }
            return data.result || [];
        }, 60); // Cache for 60 seconds

        // Filter submissions for the specific problem
        let submissions = allSubmissions;

        if (contestId) {
            const cid = parseInt(contestId);
            submissions = submissions.filter((s: { contestId: number }) => s.contestId === cid);
        }

        if (problemIndex) {
            const idx = problemIndex.toUpperCase();
            submissions = submissions.filter((s: { problem: { index: string } }) =>
                s.problem.index.toUpperCase() === idx
            );
        }

        // Map to a clean format
        const mapped = submissions.map((s: {
            id: number;
            verdict?: string;
            timeConsumedMillis: number;
            memoryConsumedBytes: number;
            creationTimeSeconds: number;
            programmingLanguage: string;
            passedTestCount: number;
        }) => ({
            id: s.id,
            verdict: s.verdict === 'OK' ? 'Accepted' :
                s.verdict === 'WRONG_ANSWER' ? 'Wrong Answer' :
                    s.verdict === 'TIME_LIMIT_EXCEEDED' ? 'Time Limit Exceeded' :
                        s.verdict === 'MEMORY_LIMIT_EXCEEDED' ? 'Memory Limit Exceeded' :
                            s.verdict === 'RUNTIME_ERROR' ? 'Runtime Error' :
                                s.verdict === 'COMPILATION_ERROR' ? 'Compilation Error' :
                                    s.verdict || 'In Queue',
            timeConsumedMillis: s.timeConsumedMillis,
            memoryConsumedBytes: s.memoryConsumedBytes,
            creationTimeSeconds: s.creationTimeSeconds,
            language: s.programmingLanguage,
            passedTestCount: s.passedTestCount,
        }));

        return NextResponse.json({
            success: true,
            submissions: mapped,
            count: mapped.length,
        });
    } catch (err: unknown) {
        console.error('[user-submissions] Error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch user submissions'
        }, { status: 500 });
    }
}
