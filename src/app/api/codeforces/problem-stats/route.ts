import { NextRequest, NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/simple-rate-limit';

interface ProblemInfo {
    rating?: number;
    tags: string[];
    name: string;
}

interface ProblemsetData {
    problems: Record<string, ProblemInfo>;
    statistics: Record<string, number>;
}

async function fetchProblemsetData(): Promise<ProblemsetData> {
    return getOrSetCache<ProblemsetData>('cf:problemset:all', async () => {
        const res = await fetch('https://codeforces.com/api/problemset.problems', {
            headers: { 'User-Agent': 'verdict.run/1.0' },
            signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
            throw new Error(`Codeforces API returned ${res.status}`);
        }

        const data = await res.json();
        if (data.status !== 'OK') {
            throw new Error(data.comment || 'Codeforces API error');
        }

        const problems: Record<string, ProblemInfo> = {};
        const statistics: Record<string, number> = {};

        for (const p of data.result.problems) {
            const key = `${p.contestId}-${p.index}`;
            problems[key] = {
                rating: p.rating,
                tags: p.tags || [],
                name: p.name,
            };
        }

        for (const s of data.result.problemStatistics) {
            const key = `${s.contestId}-${s.index}`;
            statistics[key] = s.solvedCount;
        }

        return { problems, statistics };
    }, 3600);
}

export async function GET(req: NextRequest) {
    // Rate limit problem stats requests
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`cf-problem-stats:${ip}`, 20, 60)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const index = searchParams.get('index');

    if (!contestId || !index) {
        return NextResponse.json({ error: 'Missing contestId or index' }, { status: 400 });
    }

    const key = `${contestId}-${index.toUpperCase()}`;

    try {
        const cache = await fetchProblemsetData();
        const problem = cache.problems[key];
        const solvedCount = cache.statistics[key];

        if (!problem) {
            return NextResponse.json({
                rating: undefined,
                solvedCount: 0,
                tags: [],
                name: 'Unknown',
            });
        }

        return NextResponse.json({
            rating: problem.rating,
            solvedCount: solvedCount ?? 0,
            tags: problem.tags,
            name: problem.name,
        });
    } catch (err: unknown) {
        console.error('[problem-stats] Failed to fetch from CF API:', err);
        return NextResponse.json({
            rating: undefined,
            solvedCount: 0,
            tags: [],
            name: 'Unknown',
        });
    }
}
