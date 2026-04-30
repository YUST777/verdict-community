import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const keysParam = searchParams.get('keys');

  try {
    let res;
    if (keysParam) {
      const keys = keysParam.split(',').map(k => k.trim()).filter(Boolean);
      if (keys.length === 0) return NextResponse.json({ prefs: {} });
      const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
      res = await query(
        `SELECT key, value FROM user_preferences WHERE user_id = $1 AND key IN (${placeholders})`,
        [auth.id, ...keys]
      );
    } else {
      res = await query('SELECT key, value FROM user_preferences WHERE user_id = $1', [auth.id]);
    }

    const prefs: Record<string, string> = {};
    for (const row of res.rows) prefs[row.key] = row.value;
    return NextResponse.json({ prefs });
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

    const entries = Object.entries(prefs).slice(0, 50);
    if (entries.length === 0) return NextResponse.json({ ok: true });

    const values: unknown[] = [];
    const rows: string[] = [];
    let idx = 1;
    for (const [key, value] of entries) {
      rows.push(`($${idx}, $${idx + 1}, $${idx + 2}, NOW())`);
      values.push(auth.id, String(key).slice(0, 100), String(value));
      idx += 3;
    }

    await query(
      `INSERT INTO user_preferences (user_id, key, value, updated_at)
       VALUES ${rows.join(', ')}
       ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      values
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
