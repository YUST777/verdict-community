import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { scrapeCodeforces, extractUsername } from '@/lib/codeforces';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

// Add type definition for global
declare global {
    var cfRefreshRateLimits: Map<string, number> | undefined;
}

export async function POST(request: NextRequest) {
    try {
        if (!JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: { id?: number; userId?: number };

        try {
            decoded = jwt.verify(token, JWT_SECRET as string) as { id?: number; userId?: number };
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.id || decoded.userId;
        if (!userId) {
            return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
        }

        // Rate Limiting (In-Memory) - Strictly limit scraping to avoid IP Ban
        const RATE_LIMIT_DURATION = 60 * 1000; // 60 seconds
        const lastRefreshTime = global.cfRefreshRateLimits?.get(String(userId)) || 0;
        const now = Date.now();

        if (now - lastRefreshTime < RATE_LIMIT_DURATION) {
            const waitSeconds = Math.ceil((RATE_LIMIT_DURATION - (now - lastRefreshTime)) / 1000);
            return NextResponse.json(
                { error: `Please wait ${waitSeconds}s before refreshing again` },
                { status: 429 }
            );
        }

        // Initialize global map if needed
        if (!global.cfRefreshRateLimits) {
            global.cfRefreshRateLimits = new Map();
        }
        global.cfRefreshRateLimits.set(String(userId), now);

        // Get user's codeforces_handle from users table
        const userResult = await query('SELECT codeforces_handle FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const cfHandle = userResult.rows[0].codeforces_handle;
        if (!cfHandle) {
            return NextResponse.json({ error: 'No Codeforces profile linked' }, { status: 400 });
        }

        // The handle is stored in plaintext in users table
        const username = extractUsername(cfHandle, 'codeforces');

        if (!username) {
            return NextResponse.json({ error: 'Invalid Codeforces handle' }, { status: 400 });
        }

        const codeforcesData = await scrapeCodeforces(username);

        if (codeforcesData) {
            // Store codeforces_data in users table (not applications)
            await query(
                'UPDATE users SET codeforces_data = $1 WHERE id = $2',
                [JSON.stringify(codeforcesData), userId]
            );
            return NextResponse.json({ success: true, data: codeforcesData });
        } else {
            console.warn(`Scraping returned null for ${username}`);
            return NextResponse.json({ error: 'Failed to scrape Codeforces data' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error refreshing Codeforces:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

