import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { entityType, entityId } = await req.json();
    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const alreadyViewed = await query(
      `SELECT 1 FROM view_logs WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3 LIMIT 1`,
      [user.id, entityType, entityId]
    );

    if (alreadyViewed.rows.length === 0) {
      await query(
        `INSERT INTO view_logs (user_id, entity_type, entity_id) VALUES ($1, $2, $3)`,
        [user.id, entityType, entityId]
      );

      await query(
        `INSERT INTO page_views (entity_type, entity_id, views_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (entity_type, entity_id)
         DO UPDATE SET views_count = page_views.views_count + 1`,
        [entityType, entityId]
      );
    }

    const result = await query(
      `SELECT COALESCE(views_count, 0) AS views FROM page_views WHERE entity_type = $1 AND entity_id = $2`,
      [entityType, entityId]
    );

    return NextResponse.json({ views: Number(result.rows[0]?.views || 0) });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
