import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 200 });
    }

    const userResult = await query(
      `SELECT id, email, last_login_at, created_at, application_id, 
              telegram_username, role, profile_picture, codeforces_handle, codeforces_data,
              university_id, faculty, username, display_name, name
       FROM users
       WHERE id = $1`,
      [authUser.id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 200 });
    }

    const user = userResult.rows[0];

    // Fetch university info separately (safe if columns differ between DBs)
    let universityInfo = null;
    if (user.university_id) {
      try {
        const uniResult = await query('SELECT * FROM universities WHERE id = $1', [user.university_id]);
        if (uniResult.rows.length > 0) {
          const u = uniResult.rows[0];
          universityInfo = {
            id: u.id,
            name: u.name,
            shortName: u.short_name,
            slug: u.slug || u.short_name?.toLowerCase() || '',
            type: u.type || 'public',
          };
        }
      } catch { /* universities table may have different schema */ }
    }
    const decryptedEmail = decrypt(user.email) || user.email;

    let profile: any = null;
    if (user.application_id) {
      const appResult = await query('SELECT * FROM applications WHERE id = $1', [user.application_id]);
      if (appResult.rows.length > 0) profile = appResult.rows[0];
    }

    if (!profile) profile = {};

    if (user.codeforces_data) {
      profile.codeforces_data = typeof user.codeforces_data === 'string'
        ? JSON.parse(user.codeforces_data)
        : user.codeforces_data;
    }

    if (!profile.codeforces_profile && user.codeforces_handle) {
      profile.codeforces_profile = user.codeforces_handle;
    }

    const achievementResult = await query('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [user.id]);
    const achievementIds = achievementResult.rows.map((r: { achievement_id: string }) => r.achievement_id);
    profile.achievements = achievementIds;
    profile.sheet_1_solved = achievementIds.includes('sheet-1');
    profile.is_approval_unlocked = achievementIds.includes('approval');

    if (!profile.telegram_username && user.telegram_username) {
      profile.telegram_username = user.telegram_username;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: Number(user.id),
        email: decryptedEmail,
        name: user.display_name || user.name || null,
        username: user.username || null,
        isVerified: true,
        lastLogin: user.last_login_at,
        createdAt: user.created_at,
        role: user.role || 'trainee',
        profile_picture: user.profile_picture || null,
        codeforces_handle: user.codeforces_handle || null,
        faculty: user.faculty || null,
        studentLevel: user.student_level || null,
        university: universityInfo,
      },
      profile,
    });
  } catch (err) {
    console.error('[auth/me] Error:', err);
    return NextResponse.json({ authenticated: false, user: null, profile: null }, { status: 200 });
  }
}
