import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { scrapeCodeforces, extractUsername } from '@/lib/codeforces';

declare global {
  var cfRefreshRateLimits: Map<string, number> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authUser.id;
    const RATE_LIMIT_DURATION = 60 * 1000;
    const lastRefreshTime = global.cfRefreshRateLimits?.get(String(userId)) || 0;
    const now = Date.now();

    if (now - lastRefreshTime < RATE_LIMIT_DURATION) {
      const waitSeconds = Math.ceil((RATE_LIMIT_DURATION - (now - lastRefreshTime)) / 1000);
      return NextResponse.json({ error: `Please wait ${waitSeconds}s before refreshing again` }, { status: 429 });
    }

    if (!global.cfRefreshRateLimits) global.cfRefreshRateLimits = new Map();
    global.cfRefreshRateLimits.set(String(userId), now);

    const userResult = await query('SELECT codeforces_handle FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cfHandle = userResult.rows[0].codeforces_handle;
    if (!cfHandle) {
      return NextResponse.json({ error: 'No Codeforces profile linked' }, { status: 400 });
    }

    const username = extractUsername(cfHandle, 'codeforces');
    if (!username) {
      return NextResponse.json({ error: 'Invalid Codeforces handle' }, { status: 400 });
    }

    const codeforcesData = await scrapeCodeforces(username);
    if (!codeforcesData) {
      return NextResponse.json({ error: 'Failed to scrape Codeforces data' }, { status: 500 });
    }

    await query('UPDATE users SET codeforces_data = $1 WHERE id = $2', [JSON.stringify(codeforcesData), userId]);

    return NextResponse.json({ success: true, data: codeforcesData });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
