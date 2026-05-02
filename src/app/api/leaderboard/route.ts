import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getCachedData, setCachedData } from '@/lib/redis';

function getShortName(fullName: string | null): string {
  if (!fullName) return 'Anonymous';
  const cleaned = fullName.split('/')[0].trim();
  const parts = cleaned.trim().split(/\s+/);
  if (parts.length <= 2) return cleaned.trim();
  const firstName = parts[0];
  const lastPart = parts[parts.length - 1];
  return `${firstName} ${lastPart}`;
}

function extractUsername(profileUrl: string, platform: string): string | null {
  if (!profileUrl) return null;
  try {
    if (!profileUrl.includes('/') && !profileUrl.includes('.')) return profileUrl.trim();
    const url = new URL(profileUrl.includes('://') ? profileUrl : `https://${profileUrl}`);
    const parts = url.pathname.split('/').filter(Boolean);
    if (platform === 'codeforces') {
      const profileIndex = parts.indexOf('profile');
      if (profileIndex !== -1 && parts[profileIndex + 1]) return parts[profileIndex + 1];
      if (parts.length > 0) return parts[parts.length - 1];
    }
    return parts[parts.length - 1] || null;
  } catch {
    return profileUrl.trim();
  }
}

export async function GET() {
  try {
    const cacheKey = 'leaderboard:codeforces:top100';
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const result = await query(`
      SELECT
        COALESCE(u.display_name, u.name, u.email) as name,
        u.codeforces_handle as codeforces_profile,
        u.codeforces_data,
        (u.codeforces_data->>'handle') as handle,
        (u.codeforces_data->>'rating')::int as rating
      FROM users u
      WHERE u.codeforces_data IS NOT NULL
        AND (u.show_on_cf_leaderboard = TRUE OR u.show_on_cf_leaderboard IS NULL)
        AND (u.is_shadow_banned IS NULL OR u.is_shadow_banned = FALSE)
        AND (u.codeforces_data->>'rating')::int > 0
      ORDER BY (u.codeforces_data->>'rating')::int DESC
      LIMIT 100
    `);

    const leaderboard = result.rows.map((row: any) => {
      let data: any = row.codeforces_data || {};
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch { data = {}; }
      }

      const username = row.handle || extractUsername(row.codeforces_profile || '', 'codeforces') || '?';
      const decryptedName = decrypt(row.name) || row.name;

      return {
        name: getShortName(decryptedName),
        handle: username,
        rating: row.rating,
        rank: data.rank || 'unrated',
        maxRating: parseInt(String(data.maxRating || 0), 10),
        profileUrl: row.codeforces_profile,
      };
    });

    const responseData = { success: true, leaderboard };
    await setCachedData(cacheKey, responseData, 300); // 5 minute cache

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('[CF-Leaderboard] Error:', err);
    return NextResponse.json({ success: false, leaderboard: [], error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
