import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemId, role, content, contextType } = body;

        if (!problemId || !role || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const ct = contextType || 'chat';
        if (!['chat', 'teach_me', 'video_explainer'].includes(ct)) {
            return NextResponse.json({ error: 'Invalid context type' }, { status: 400 });
        }

        // 1. Ensure the conversation exists for this user and problem.
        // We use ON CONFLICT DO UPDATE SET updated_at = NOW() to get the row ID back.
        const convResult = await query(`
            INSERT INTO ai_conversations (user_id, problem_id, updated_at) 
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id, problem_id) 
            DO UPDATE SET updated_at = NOW()
            RETURNING id
        `, [user.id, problemId]);

        const conversationId = convResult.rows[0].id;

        // 2. Insert the message
        await query(`
            INSERT INTO ai_messages (conversation_id, role, content, context_type)
            VALUES ($1, $2, $3, $4)
        `, [conversationId, role, content, ct]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[AI Log POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
