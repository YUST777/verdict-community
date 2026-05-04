import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { getCachedData, setCachedData } from '@/lib/redis';

function getShortName(fullName: string | null): string {
  if (!fullName) return 'Anonymous';
  const cleaned = fullName.split('/')[0].trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return cleaned;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const universityId = searchParams.get('universityId');

    const cacheKey = `leaderboard:sheets:${universityId || 'all'}`;
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const uniFilter = universityId ? 'AND u.university_id = $1' : '';
    const params = universityId ? [universityId] : [];

    const result = await query(`
      SELECT
        u.id,
        u.email,
        u.username,
        u.university_id,
        u.display_name,
        uni.short_name AS university_short_name,
        lc.solved_count,
        lc.accepted_count,
        lc.total_submissions,
        u.cheating_flags
      FROM public.leaderboard_cache lc
      INNER JOIN public.users u ON u.id = lc.user_id
      LEFT JOIN public.universities uni ON uni.id = u.university_id
      WHERE (u.is_shadow_banned = FALSE OR u.is_shadow_banned IS NULL)
        AND lc.solved_count > 0
        ${uniFilter}
      ORDER BY lc.solved_count DESC, lc.total_submissions ASC, lc.last_solve_at ASC
      LIMIT 100
    `, params);

    const leaderboard = result.rows.map((row: any) => {
      // 1. Prioritize plaintext display_name if available
      // 2. Otherwise decrypt the full name
      // 3. If the username exists and isn't just a numeric string, use it
      // 4. Fallback to email prefix
      
      let finalName = 'Anonymous';
      
      const rawName = row.display_name;
      if (rawName) {
        const decrypted = decrypt(rawName);
        if (decrypted) {
          finalName = getShortName(decrypted);
        } else if (!/^[0-9a-f]{32,}$/i.test(rawName)) {
          // If not hex-encrypted, use as is (unless it's a long hex string)
          finalName = getShortName(rawName);
        }
      }
      
      // If we still have 'Anonymous' or a numeric/hex string, try username or email
      if (finalName === 'Anonymous' || /^\d+$/.test(finalName) || /^[0-9a-f]{32,}$/i.test(finalName)) {
        if (row.username && !/^\d+$/.test(row.username)) {
          finalName = row.username;
        } else if (row.email) {
          const decryptedEmail = decrypt(row.email) || row.email;
          finalName = decryptedEmail.split('@')[0];
        }
      }

      return {
        userId: Number(row.id),
        username: finalName,
        universityShortName: row.university_short_name || null,
        solvedCount: Number(row.solved_count) || 0,
        totalSubmissions: Number(row.total_submissions) || 0,
        acceptedCount: Number(row.accepted_count) || 0,
        cheatingFlags: Number(row.cheating_flags) || 0,
      };
    });

    const responseData = { success: true, leaderboard };
    await setCachedData(cacheKey, responseData, 600); // 10 minute cache

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('[Sheets-Leaderboard] Error:', err);
    return NextResponse.json({ success: false, leaderboard: [] }, { status: 500 });
  }
}
