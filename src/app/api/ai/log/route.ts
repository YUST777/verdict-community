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
        // The current schema does not enforce a unique constraint on (user_id, problem_id),
        // so we manually SELECT/UPDATE/INSERT instead of relying on ON CONFLICT.
        let conversationId: string;

        const existingConv = await query(
            `
            SELECT id
            FROM ai_conversations
            WHERE user_id = $1 AND problem_id = $2
            ORDER BY updated_at DESC
            LIMIT 1
        `,
            [user.id, problemId]
        );

        if (existingConv.rows.length > 0) {
            conversationId = existingConv.rows[0].id;
            await query(
                `
                UPDATE ai_conversations
                SET updated_at = NOW()
                WHERE id = $1
            `,
                [conversationId]
            );
        } else {
            const convResult = await query(
                `
                INSERT INTO ai_conversations (user_id, problem_id, updated_at)
                VALUES ($1, $2, NOW())
                RETURNING id
            `,
                [user.id, problemId]
            );
            conversationId = convResult.rows[0].id;
        }

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
