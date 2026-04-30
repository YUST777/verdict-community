import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get('newsId');
  const newsIdsParam = searchParams.get('newsIds');
  if (!newsId && !newsIdsParam) {
    return NextResponse.json({ error: 'newsId or newsIds is required' }, { status: 400 });
  }

  const ids = (newsIdsParam ? newsIdsParam.split(',') : [newsId as string]).filter(Boolean);
  const responseMap: Record<string, { counts: { like: number; heart: number; fire: number }; userReactions: string[] }> = {};
  ids.forEach(id => {
    responseMap[id] = { counts: { like: 0, heart: 0, fire: 0 }, userReactions: [] };
  });

  const countsResult = await query(
    `SELECT news_id, reaction_type, COUNT(*) as count
     FROM news_reactions
     WHERE news_id = ANY($1)
     GROUP BY news_id, reaction_type`,
    [ids]
  );

  countsResult.rows.forEach((row: any) => {
    if (responseMap[row.news_id]) {
      responseMap[row.news_id].counts[row.reaction_type as 'like' | 'heart' | 'fire'] = Number(row.count) || 0;
    }
  });

  const userReactions = await query(
    `SELECT news_id, reaction_type FROM news_reactions WHERE news_id = ANY($1) AND user_id = $2`,
    [ids, auth.id]
  );

  userReactions.rows.forEach((row: any) => {
    if (responseMap[row.news_id]) {
      responseMap[row.news_id].userReactions.push(row.reaction_type);
    }
  });

  if (newsId && !newsIdsParam) return NextResponse.json(responseMap[newsId]);
  return NextResponse.json(responseMap);
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { newsId, reactionType } = await req.json();
  if (!newsId || !reactionType || !['like', 'heart', 'fire'].includes(reactionType)) {
    return NextResponse.json({ error: 'Invalid reaction payload' }, { status: 400 });
  }

  const toggleResult = await query(
    `WITH deleted AS (
       DELETE FROM news_reactions
       WHERE news_id = $1 AND user_id = $2 AND reaction_type = $3
       RETURNING id
     ), inserted AS (
       INSERT INTO news_reactions (news_id, user_id, reaction_type)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM deleted)
       RETURNING id
     )
     SELECT CASE WHEN EXISTS (SELECT 1 FROM deleted) THEN 'removed' ELSE 'added' END AS action`,
    [newsId, auth.id, reactionType]
  );

  return NextResponse.json({ action: toggleResult.rows[0]?.action || 'added', reactionType });
}
