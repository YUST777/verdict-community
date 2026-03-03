import { NextResponse } from 'next/server';
import { fetchAcceptedSolution } from '@/lib/solutions';
import { getCache, setCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { contestId, problemIndex, language } = body;

        if (!contestId || !problemIndex) {
            return NextResponse.json(
                { error: 'contestId and problemIndex are required.' },
                { status: 400 }
            );
        }

        const idx = problemIndex.toUpperCase();
        const cacheKey = `cf:solution:${contestId}-${idx}-${language || 'any'}`;

        // Check Redis cache first
        const cached = await getCache<{ found: boolean; code?: string; language?: string; author?: string; message?: string }>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const result = await fetchAcceptedSolution(
            parseInt(contestId, 10),
            idx,
            language
        );

        if (!result) {
            const notFoundResponse = { found: false, message: 'No archived accepted solution found.' };
            // Cache "not found" for 5 minutes (might become available later)
            setCache(cacheKey, notFoundResponse, 300).catch(() => {});
            return NextResponse.json(notFoundResponse);
        }

        const foundResponse = {
            found: true,
            code: result.code,
            language: result.language,
            author: result.author
        };
        // Cache found solutions for 24 hours
        setCache(cacheKey, foundResponse, 86400).catch(() => {});
        return NextResponse.json(foundResponse);
    } catch (error: unknown) {
        console.error('Solutions fetch API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch solution.' },
            { status: 500 }
        );
    }
}
