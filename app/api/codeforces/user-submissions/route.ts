import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export const dynamic = 'force-dynamic';

interface CFUserSubmission {
    id: number;
    contestId?: number;
    creationTimeSeconds: number;
    verdict?: string;
    timeConsumedMillis?: number;
    memoryConsumedBytes?: number;
    programmingLanguage?: string;
    problem?: { index?: string };
    passedTestCount?: number;
}

/**
 * Fetch user's own submissions for a specific problem from Codeforces.
 * Uses the user.status API filtered by contest and problem index.
 * 
 * Query params:
 *   - handle: Codeforces user handle (required)
 *   - contestId: Contest ID (required) 
 *   - problemIndex: Problem index like "A", "B", etc (optional, filters results)
 */
export async function GET(request: NextRequest) {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    if (!checkRateLimit(`user-submissions:${ip}`, 20, 60)) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const contestId = searchParams.get('contestId');
    const problemIndex = searchParams.get('problemIndex');

    if (!handle) {
        return NextResponse.json({ error: 'Missing handle parameter' }, { status: 400 });
    }

    if (!contestId) {
        return NextResponse.json({ error: 'Missing contestId parameter' }, { status: 400 });
    }

    try {
        // Fetch more submissions to ensure we get the user's submissions for this problem
        // Codeforces API allows up to 10000, but we'll fetch 1000 to be safe
        const apiUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`;

        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Verdict/1.0 (Competitive Programming Tool)',
                'Accept': 'application/json'
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.error('[User Submissions] API Error:', response.status, await response.text().catch(() => ''));
            return NextResponse.json({
                error: `Codeforces API Error: ${response.status}`,
                success: false
            }, { status: response.status });
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('[User Submissions] API Status Error:', data.comment || 'Unknown error');
            return NextResponse.json({
                error: data.comment || 'Codeforces API failed',
                success: false
            }, { status: 500 });
        }

        if (!data.result || !Array.isArray(data.result)) {
            console.error('[User Submissions] Invalid API response:', data);
            return NextResponse.json({
                error: 'Invalid API response',
                success: false,
                submissions: []
            });
        }

        // Filter submissions by contestId and optionally by problemIndex
        const normalizedContestId = contestId.toString();
        let userSubmissions = (data.result as CFUserSubmission[]).filter((sub) => {
            const subContestId = sub.contestId?.toString();
            return subContestId === normalizedContestId;
        });

        if (problemIndex) {
            const normalizedProblemIndex = problemIndex.toUpperCase().trim();
            userSubmissions = userSubmissions.filter((sub) => {
                const subIndex = sub.problem?.index?.toUpperCase().trim();
                return subIndex === normalizedProblemIndex;
            });
        }

        // Sort by creation time (newest first)
        userSubmissions.sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);

        // Map to clean format
        const cleanSubmissions = userSubmissions.map((sub) => ({
            id: sub.id,
            creationTimeSeconds: sub.creationTimeSeconds,
            verdict: sub.verdict === 'OK' ? 'Accepted' : sub.verdict,
            timeConsumedMillis: sub.timeConsumedMillis,
            memoryConsumedBytes: sub.memoryConsumedBytes,
            language: sub.programmingLanguage,
            problemIndex: sub.problem?.index,
            passedTestCount: sub.passedTestCount
        }));

        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.log('[User Submissions]', {
                handle,
                contestId,
                problemIndex,
                totalSubmissions: data.result.length,
                filteredByContest: userSubmissions.length,
                finalCount: cleanSubmissions.length
            });
        }

        return NextResponse.json({
            success: true,
            handle,
            contestId,
            problemIndex,
            submissions: cleanSubmissions
        });

    } catch (error) {
        console.error('[User Submissions API Error]', error);
        return NextResponse.json({
            error: 'Failed to fetch user submissions'
        }, { status: 500 });
    }
}
