import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    const result = await query(`
      SELECT
        COALESCE(u.display_name, u.name, u.email) as name,
        u.codeforces_handle as codeforces_profile,
        u.codeforces_data,
        (u.codeforces_data::json->>'handle') as handle
      FROM users u
      WHERE u.codeforces_data IS NOT NULL
        AND (u.show_on_cf_leaderboard = TRUE OR u.show_on_cf_leaderboard IS NULL)
        AND (u.is_shadow_banned IS NULL OR u.is_shadow_banned = FALSE)
    `);

    const leaderboard = result.rows
      .map((row: any) => {
        let data: any = {};
        try {
          data = typeof row.codeforces_data === 'string' ? JSON.parse(row.codeforces_data) : row.codeforces_data;
        } catch {
          data = {};
        }

        const rating = parseInt(String(data.rating || 0), 10);
        const username = row.handle || extractUsername(row.codeforces_profile || '', 'codeforces') || '?';

        return {
          name: getShortName(row.name),
          handle: username,
          rating,
          rank: data.rank || 'unrated',
          maxRating: parseInt(String(data.maxRating || 0), 10),
          profileUrl: row.codeforces_profile,
        };
      })
      .filter((user: any) => user.rating > 0)
      .sort((a: any, b: any) => b.rating - a.rating);

    return NextResponse.json({ success: true, leaderboard }, { headers });
  } catch {
    return NextResponse.json({ success: false, leaderboard: [], error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
