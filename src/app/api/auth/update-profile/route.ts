import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authUser = await verifyAuth(req);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const telegram_username = body.telegram_username;
    const codeforces_profile = body.codeforces_profile;
    const leetcode_profile = body.leetcode_profile;


    if (telegram_username !== undefined) {
      const sanitizedTelegram = String(telegram_username).replace(/^@/, '').substring(0, 32);
      await query('UPDATE users SET telegram_username = $1 WHERE id = $2', [sanitizedTelegram, authUser.id]);
    }

    if (codeforces_profile !== undefined) {
      const sanitizedCf = String(codeforces_profile).trim().substring(0, 120);
      await query('UPDATE users SET codeforces_handle = $1 WHERE id = $2', [sanitizedCf || null, authUser.id]);
    }

    if (leetcode_profile !== undefined) {
      const sanitizedLc = String(leetcode_profile).trim().substring(0, 120);
      await query('UPDATE users SET leetcode_handle = $1 WHERE id = $2', [sanitizedLc || null, authUser.id]);
    }

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
