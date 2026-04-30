import { NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/simple-rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        // Rate limit search requests
        const ip = (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) || 'unknown';
        if (!checkRateLimit(`search:${ip}`, 15, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Check Redis cache first
        const cacheKey = `search:${query.trim().toLowerCase()}`;
        const cached = await getCache<{ results: unknown[] }>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Dynamic imports to avoid "File is not defined" at build time
        const { search, SafeSearchType } = await import('duck-duck-scrape');
        const ytSearch = (await import('yt-search')).default;

        // Run web + YouTube searches in parallel
        const [webRaw, ytRaw] = await Promise.allSettled([
            search(query, { safeSearch: SafeSearchType.STRICT }),
            ytSearch(query),
        ]);

        const webResults =
            webRaw.status === 'fulfilled'
                ? webRaw.value.results.slice(0, 4).map(r => ({
                    title: r.title,
                    description: r.description,
                    url: r.url,
                    type: 'web' as const,
                }))
                : [];

        const ytResults =
            ytRaw.status === 'fulfilled' && ytRaw.value && ytRaw.value.videos
                ? ytRaw.value.videos
                    .slice(0, 2)
                    .map(r => ({
                        title: r.title,
                        description: `By ${r.author?.name} • ${r.views} views • ${r.timestamp}`,
                        url: r.url,
                        duration: r.timestamp,
                        author: r.author?.name,
                        views: r.views,
                        thumbnail: r.thumbnail,
                        type: 'youtube' as const,
                    }))
                : [];

        const results = [...webResults, ...ytResults];

        // Cache non-empty results for 5 minutes
        if (results.length > 0) {
            setCache(cacheKey, { results }, 300).catch(() => { });
        }

        return NextResponse.json({ results });
    } catch (error: unknown) {
        console.error('Search error', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}
