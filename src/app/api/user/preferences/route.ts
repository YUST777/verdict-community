import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query('SELECT settings FROM users WHERE id = $1', [auth.id]);
    const settings = res.rows[0]?.settings || {};
    return NextResponse.json({ prefs: settings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prefs } = await request.json();
    if (!prefs || typeof prefs !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    await query(
      'UPDATE users SET settings = settings || $1 WHERE id = $2',
      [JSON.stringify(prefs), auth.id]
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
