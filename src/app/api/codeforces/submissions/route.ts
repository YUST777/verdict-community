import { NextRequest, NextResponse } from 'next/server';
import { getOrSetCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/simple-rate-limit';

interface GlobalDistribution {
    runtimeDistribution: { label: string; count: number; rangeStart: number; rangeEnd: number }[];
    memoryDistribution: { label: string; count: number; rangeStart: number; rangeEnd: number }[];
    totalAccepted: number;
    medianRuntime: number;
    medianMemory: number;
    languages: { name: string; count: number }[];
}

export async function GET(req: NextRequest) {
    // Rate limit distribution requests
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`cf-submissions:${ip}`, 10, 60)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const problemIndex = searchParams.get('problemIndex');

    if (!contestId || !problemIndex) {
        return NextResponse.json({ error: 'Missing contestId or problemIndex' }, { status: 400 });
    }

    const cacheKey = `cf:global-dist:${contestId}-${problemIndex.toUpperCase()}`;

    try {
        // Use Redis cache with 30-minute TTL (replaces in-memory Map)
        const result = await getOrSetCache<GlobalDistribution | null>(cacheKey, async () => {
            return await fetchGlobalDistribution(parseInt(contestId), problemIndex.toUpperCase());
        }, 1800); // 30 minutes

        if (!result) {
            return NextResponse.json({
                success: true,
                runtimeDistribution: [],
                memoryDistribution: [],
                totalAccepted: 0,
                medianRuntime: 0,
                medianMemory: 0,
                languages: [],
            });
        }

        return NextResponse.json({ success: true, ...result });
    } catch (err: unknown) {
        console.error('[submissions] Error fetching global distribution:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch submission data'
        }, { status: 500 });
    }
}

async function fetchGlobalDistribution(cid: number, idx: string): Promise<GlobalDistribution | null> {
    // Fetch in batches — get up to 10000 submissions
    const batchSize = 5000;
    const allAccepted: { time: number; memory: number; lang: string }[] = [];

    for (let from = 1; from <= 10001; from += batchSize) {
        const url = `https://codeforces.com/api/contest.status?contestId=${cid}&from=${from}&count=${batchSize}`;

        const res = await fetch(url, {
            headers: { 'User-Agent': 'verdict.run/1.0' },
            signal: AbortSignal.timeout(20000),
        });

        if (!res.ok) {
            if (res.status === 400) {
                // Contest not found or invalid
                break;
            }
            throw new Error(`CF API returned ${res.status}`);
        }

        const data = await res.json();
        if (data.status !== 'OK') break;

        const subs = data.result || [];
        if (subs.length === 0) break;

        // Filter: accepted + matching problem index
        for (const s of subs) {
            if (s.verdict === 'OK' && s.problem?.index?.toUpperCase() === idx) {
                allAccepted.push({
                    time: s.timeConsumedMillis,
                    memory: s.memoryConsumedBytes,
                    lang: s.programmingLanguage,
                });
            }
        }

        // If we got less than batchSize, no more pages
        if (subs.length < batchSize) break;

        // Rate limit: CF allows 1 req/2sec for non-auth
        await new Promise(r => setTimeout(r, 2100));
    }

    if (allAccepted.length === 0) {
        return null;
    }

    // Sort for percentile calculations
    const times = allAccepted.map(s => s.time).sort((a, b) => a - b);
    const memories = allAccepted.map(s => s.memory / 1024).sort((a, b) => a - b); // Convert to KB

    // Build 10-bucket distributions
    const runtimeDist = buildDistribution(times, 'ms');
    const memoryDist = buildDistribution(memories, 'KB');

    // Language breakdown
    const langCounts = new Map<string, number>();
    for (const s of allAccepted) {
        const lang = simplifyLanguage(s.lang);
        langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
    }
    const languages = Array.from(langCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    const result: GlobalDistribution = {
        runtimeDistribution: runtimeDist,
        memoryDistribution: memoryDist,
        totalAccepted: allAccepted.length,
        medianRuntime: times[Math.floor(times.length / 2)],
        medianMemory: Math.round(memories[Math.floor(memories.length / 2)]),
        languages,
    };

    return result;
}

function buildDistribution(sortedValues: number[], unit: string) {
    if (sortedValues.length === 0) return [];

    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const bucketCount = 12;
    const step = Math.max(1, Math.ceil((max - min + 1) / bucketCount));

    return Array.from({ length: bucketCount }, (_, i) => {
        const rangeStart = min + i * step;
        const rangeEnd = rangeStart + step;
        const count = sortedValues.filter(v => v >= rangeStart && v < rangeEnd).length;

        let label: string;
        if (unit === 'KB' && rangeStart >= 1024) {
            label = `${(rangeStart / 1024).toFixed(0)}-${(rangeEnd / 1024).toFixed(0)}MB`;
        } else {
            label = `${Math.round(rangeStart)}-${Math.round(rangeEnd)}${unit}`;
        }

        return { label, count, rangeStart, rangeEnd };
    }).filter(b => b.count > 0 || true); // Keep all buckets for chart continuity
}

function simplifyLanguage(lang: string): string {
    const l = lang.toLowerCase();
    if (l.includes('c++') || l.includes('gnu c++')) return 'C++';
    if (l.includes('python') || l.includes('pypy')) return 'Python';
    if (l.includes('java')) return 'Java';
    if (l.includes('kotlin')) return 'Kotlin';
    if (l.includes('rust')) return 'Rust';
    if (l.includes('go ') || l === 'go') return 'Go';
    if (l.includes('c#') || l.includes('mono')) return 'C#';
    if (l.includes('javascript') || l.includes('node')) return 'JavaScript';
    if (l.includes('ruby')) return 'Ruby';
    if (l.includes('haskell')) return 'Haskell';
    if (l.includes('pascal') || l.includes('delphi')) return 'Pascal';
    return lang;
}
