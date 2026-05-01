import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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

    const uniFilter = universityId ? 'AND u.university_id = $1' : '';
    const params = universityId ? [universityId] : [];

    const result = await query(`
      WITH all_solves AS (
        SELECT user_id, contest_id || '-' || problem_index AS problem_key, submitted_at, id AS sub_id
        FROM cf_submissions
        WHERE verdict = 'Accepted'
      ),
      user_stats AS (
        SELECT
          user_id,
          COUNT(DISTINCT problem_key) AS solved_count,
          COUNT(sub_id) AS accepted_count,
          MAX(submitted_at) AS last_solve_at
        FROM all_solves
        GROUP BY user_id
      ),
      sub_counts AS (
        SELECT user_id, COUNT(*)::int AS total_submissions
        FROM cf_submissions
        GROUP BY user_id
      )
      SELECT
        u.id,
        u.email,
        u.name,
        u.university_id,
        u.display_name,
        uni.short_name AS university_short_name,
        us.solved_count,
        us.accepted_count,
        COALESCE(sc.total_submissions, 0) AS total_submissions
      FROM users u
      INNER JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN sub_counts sc ON u.id = sc.user_id
      LEFT JOIN universities uni ON uni.id = u.university_id
      WHERE (u.is_shadow_banned = FALSE OR u.is_shadow_banned IS NULL)
        ${uniFilter}
      ORDER BY us.solved_count DESC, COALESCE(sc.total_submissions, 0) ASC, us.last_solve_at ASC
      LIMIT 100
    `, params);

    const leaderboard = result.rows.map((row: any) => ({
      userId: Number(row.id),
      username: getShortName(row.display_name || row.name) || row.email?.split('@')[0] || 'Anonymous',
      universityShortName: row.university_short_name || null,
      solvedCount: Number(row.solved_count) || 0,
      totalSubmissions: Number(row.total_submissions) || 0,
      acceptedCount: Number(row.accepted_count) || 0,
    }));

    return NextResponse.json({ success: true, leaderboard });
  } catch {
    return NextResponse.json({ success: false, leaderboard: [] }, { status: 500 });
  }
}
