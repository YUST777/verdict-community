import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authUser.id;
    const body = await request.json();
    const { field } = body;

    if (!field || !['telegram', 'codeforces'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field. Use "telegram" or "codeforces".' }, { status: 400 });
    }

    const userResult = await query('SELECT application_id FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const applicationId = userResult.rows[0].application_id;

    if (field === 'telegram') {
      await query('UPDATE users SET telegram_username = NULL WHERE id = $1', [userId]);
      if (applicationId) {
        await query('UPDATE applications SET telegram_username = NULL WHERE id = $1', [applicationId]);
      }
    } else if (field === 'codeforces') {
      await query('UPDATE users SET codeforces_handle = NULL, codeforces_data = NULL WHERE id = $1', [userId]);
      if (applicationId) {
        await query('UPDATE applications SET codeforces_profile = NULL, codeforces_data = NULL WHERE id = $1', [applicationId]);
      }
    }

    return NextResponse.json({ success: true, message: `${field} data deleted successfully` });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
