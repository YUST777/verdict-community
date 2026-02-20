import { NextResponse } from 'next/server';
import { search, SafeSearchType } from 'duck-duck-scrape';
import ytSearch from 'yt-search';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

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

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
