import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';

interface CFSubmissionEntry {
    id: number;
    creationTimeSeconds: number;
    author?: { members?: { handle: string }[] };
    verdict?: string;
    timeConsumedMillis?: number;
    memoryConsumedBytes?: number;
    programmingLanguage?: string;
    problem: { index: string };
}

// Simple in-memory cache
// Map: "contestId" -> { timestamp, submissions[] }
const cache: Record<string, { timestamp: number; submissions: CFSubmissionEntry[] }> = {};
const CACHE_DURATION = 1000 * 30; // 30 seconds cache (Live Feed)

export async function GET(request: Request) {
    // Basic IP extraction
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';

    // Rate Limit: 30 requests per 60 seconds
    if (!checkRateLimit(`submissions:${ip}`, 30, 60)) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const problemIndex = searchParams.get('problemIndex'); // Optional filter

    if (!contestId) {
        return NextResponse.json({ error: 'Missing contestId' }, { status: 400 });
    }

    const now = Date.now();
    const cacheKey = contestId;

    let submissions: CFSubmissionEntry[] = [];

    // Check Cache
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
        submissions = cache[cacheKey].submissions;
    } else {
        try {
            // Fetch last 50 submissions
            const res = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&from=1&count=50`);

            if (!res.ok) throw new Error(`CF API responded with ${res.status}`);
            const data = await res.json();

            if (data.status !== 'OK') throw new Error(`CF API status: ${data.status}`);

            submissions = data.result;

            // Update Cache
            cache[cacheKey] = {
                timestamp: now,
                submissions: submissions
            };
        } catch (error) {
            console.error('[CF API Error]', error);
            // Return stale cache if available, else error
            if (cache[cacheKey]) {
                submissions = cache[cacheKey].submissions;
            } else {
                return NextResponse.json({ error: 'Failed to fetch Codeforces submissions' }, { status: 502 });
            }
        }
    }

    // Filter by Problem Index if requested (Case Insensitive)
    if (problemIndex) {
        submissions = submissions.filter((sub) =>
            sub.problem.index.toLowerCase() === problemIndex.toLowerCase()
        );
    }

    const cleanSubmissions = submissions.map((sub) => ({
        id: sub.id,
        creationTimeSeconds: sub.creationTimeSeconds,
        author: sub.author?.members?.[0]?.handle || 'Unknown',
        verdict: sub.verdict,
        timeConsumedMillis: sub.timeConsumedMillis,
        memoryConsumedBytes: sub.memoryConsumedBytes,
        language: sub.programmingLanguage,
        problemIndex: sub.problem.index
    }));

    return NextResponse.json(cleanSubmissions);
}
