import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/ai/chat/history?problemId=xxx
 *
 * Loads ALL chat tabs + messages for a given user + problem from the
 * normalized ai_conversations / ai_messages tables.
 *
 * Returns:
 * {
 *   tabs: [{ id: "default", label: "Chat 1" }, ...],
 *   messagesByTab: {
 *     "default": [{ id, role, content, timestamp, metadata }, ...],
 *     ...
 *   }
 * }
 *
 * Messages are ordered by `ordinal` (O(log n) via composite index).
 */
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const problemId = url.searchParams.get('problemId');
        if (!problemId) {
            return NextResponse.json({ error: 'Missing problemId' }, { status: 400 });
        }

        // 1. Load all conversations (tabs) for this user + problem
        const convResult = await query(
            `SELECT id, tab_id, title, created_at, updated_at
             FROM public.ai_conversations
             WHERE user_id = $1 AND problem_id = $2
             ORDER BY created_at ASC`,
            [user.id, problemId]
        );

        if (convResult.rows.length === 0) {
            return NextResponse.json({ tabs: [], messagesByTab: {} });
        }

        // 2. Load messages for ALL conversations in one query (batched, not N+1)
        const conversationIds = convResult.rows.map((r: any) => r.id);
        const msgResult = await query(
            `SELECT m.conversation_id, m.id, m.role, m.content, m.context_type,
                    m.metadata, m.created_at, m.ordinal
             FROM public.ai_messages m
             WHERE m.conversation_id = ANY($1)
             ORDER BY m.conversation_id, m.ordinal ASC`,
            [conversationIds]
        );

        // 3. Build the response shape
        const tabs: { id: string; label: string }[] = [];
        const messagesByTab: Record<string, any[]> = {};

        // Map conversation UUID -> tab_id for message grouping
        const convIdToTabId: Record<string, string> = {};
        for (const conv of convResult.rows) {
            const tabId = conv.tab_id || 'default';
            const title = conv.title || 'Chat 1';
            tabs.push({ id: tabId, label: title });
            convIdToTabId[conv.id] = tabId;
            messagesByTab[tabId] = [];
        }

        for (const msg of msgResult.rows) {
            const tabId = convIdToTabId[msg.conversation_id];
            if (!tabId) continue;

            const metadata = msg.metadata || {};
            messagesByTab[tabId].push({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at,
                contextType: msg.context_type,
                // Restore rich fields from metadata
                ...(metadata.codeBlock ? { codeBlock: metadata.codeBlock } : {}),
                ...(metadata.sources ? { sources: metadata.sources } : {}),
                ...(metadata.videoScript ? { videoScript: metadata.videoScript } : {}),
            });
        }

        return NextResponse.json({ tabs, messagesByTab });
    } catch (error) {
        console.error('[Chat History GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/ai/chat/history
 *
 * Saves a single message to the normalized tables.
 * Upserts the conversation row (creates if needed).
 *
 * Body: {
 *   problemId: string,
 *   tabId: string,          // client-side tab ID
 *   tabLabel: string,       // tab display label (e.g. "Chat 1")
 *   message: {
 *     id: string,
 *     role: 'user' | 'assistant' | 'sources',
 *     content: string,
 *     contextType?: 'chat' | 'teach_me' | 'video_explainer',
 *     codeBlock?: object,
 *     sources?: object[],
 *     videoScript?: object,
 *   }
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemId, tabId, tabLabel, message } = body;

        if (!problemId || !tabId || !message || !message.role || !message.content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Upsert conversation (ON CONFLICT on user_id, problem_id, tab_id)
        const convResult = await query(
            `INSERT INTO public.ai_conversations (user_id, problem_id, tab_id, title, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id, problem_id, tab_id)
             DO UPDATE SET title = COALESCE(EXCLUDED.title, ai_conversations.title),
                           updated_at = NOW()
             RETURNING id`,
            [user.id, problemId, tabId, tabLabel || 'Chat']
        );
        const conversationId = convResult.rows[0].id;

        // 2. Get next ordinal for this conversation
        const ordResult = await query(
            `SELECT COALESCE(MAX(ordinal), 0) + 1 as next_ord
             FROM public.ai_messages
             WHERE conversation_id = $1`,
            [conversationId]
        );
        const nextOrdinal = ordResult.rows[0].next_ord;

        // 3. Build metadata (rich fields stored separately from content)
        const metadata: Record<string, any> = {};
        if (message.codeBlock) metadata.codeBlock = message.codeBlock;
        if (message.sources) metadata.sources = message.sources;
        if (message.videoScript) metadata.videoScript = message.videoScript;

        // 4. Insert message with ordinal
        const ct = message.contextType || 'chat';
        await query(
            `INSERT INTO public.ai_messages (conversation_id, role, content, context_type, metadata, ordinal)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [conversationId, message.role, message.content, ct,
             Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '{}',
             nextOrdinal]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Chat History POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/ai/chat/history
 *
 * Deletes a conversation (tab) and all its messages.
 * Body: { problemId, tabId }
 */
export async function DELETE(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemId, tabId } = body;

        if (!problemId || !tabId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // CASCADE delete will remove all ai_messages for this conversation
        await query(
            `DELETE FROM public.ai_conversations
             WHERE user_id = $1 AND problem_id = $2 AND tab_id = $3`,
            [user.id, problemId, tabId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Chat History DELETE Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
