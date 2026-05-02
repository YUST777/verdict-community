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
 *   },
 *   conceptsByTab: {
 *     "default": [{ title, url, type }, ...],
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

        // 1. Load all conversations (tabs) for this user + context (currently only 'problem')
        const convResult = await query(
            `SELECT id, tab_id, title, metadata, created_at, updated_at
             FROM public.ai_conversations
             WHERE user_id = $1 AND context_id = $2 AND context_type = 'problem'
             ORDER BY created_at ASC`,
            [user.id, problemId]
        );

        if (convResult.rows.length === 0) {
            return NextResponse.json({ tabs: [], messagesByTab: {}, conceptsByTab: {} });
        }

        // 2. Load messages for ALL conversations in one query (batched, not N+1)
        const conversationIds = convResult.rows.map((r: any) => r.id);
        const msgResult = await query(
            `SELECT m.conversation_id, m.client_id, m.role, m.content, m.context_type,
                    m.metadata, m.created_at, m.ordinal
             FROM public.ai_messages m
             WHERE m.conversation_id = ANY($1)
             ORDER BY m.conversation_id, m.ordinal ASC`,
            [conversationIds]
        );

        // 3. Build the response shape
        const tabs: { id: string; label: string }[] = [];
        const messagesByTab: Record<string, any[]> = {};
        const conceptsByTab: Record<string, any[]> = {};
        const aiCodeByTab: Record<string, string> = {};

        // Map conversation UUID -> tab_id for message grouping
        const convIdToTabId: Record<string, string> = {};
        for (const conv of convResult.rows) {
            const tabId = conv.tab_id || 'default';
            const title = conv.title || 'Chat 1';
            tabs.push({ id: tabId, label: title });
            convIdToTabId[conv.id] = tabId;
            messagesByTab[tabId] = [];

            // Load concepts and aiCode from conversation metadata
            const convMeta = conv.metadata || {};
            if (convMeta.aiCode) {
                aiCodeByTab[tabId] = convMeta.aiCode;
            }
            if (convMeta.concepts && Array.isArray(convMeta.concepts)) {
                conceptsByTab[tabId] = convMeta.concepts;
            }
        }

        for (const msg of msgResult.rows) {
            const tabId = convIdToTabId[msg.conversation_id];
            if (!tabId) continue;

            const metadata = msg.metadata || {};
            messagesByTab[tabId].push({
                id: msg.client_id || msg.id,
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

        return NextResponse.json({ tabs, messagesByTab, conceptsByTab, aiCodeByTab });
    } catch (error) {
        console.error('[Chat History GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/ai/chat/history
 *
 * Saves (or upserts) a single message to the normalized tables.
 * Upserts the conversation row (creates if needed).
 * If a message with the same client_id already exists in the conversation,
 * it is UPDATED (content + metadata). Otherwise it is INSERTed.
 *
 * Body: {
 *   problemId: string,
 *   tabId: string,          // client-side tab ID
 *   tabLabel: string,       // tab display label (e.g. "Chat 1")
 *   message: {
 *     id: string,           // client-side message ID (used as client_id)
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

        if (!problemId || !tabId || !message || !message.role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Allow empty content for sources messages (they have sources in metadata)
        if (!message.content && !message.sources) {
            return NextResponse.json({ error: 'Missing content' }, { status: 400 });
        }

        // 1. Upsert conversation (ON CONFLICT on user_id, context_id, context_type, tab_id)
        const convResult = await query(
            `INSERT INTO public.ai_conversations (user_id, context_id, context_type, tab_id, title, updated_at)
             VALUES ($1, $2, 'problem', $3, $4, NOW())
             ON CONFLICT (user_id, context_id, context_type, tab_id)
             DO UPDATE SET title = COALESCE(EXCLUDED.title, ai_conversations.title),
                           updated_at = NOW()
             RETURNING id`,
            [user.id, problemId, tabId, tabLabel || 'Chat']
        );
        const conversationId = convResult.rows[0].id;

        // 2. Build metadata (rich fields stored separately from content)
        const metadata: Record<string, any> = {};
        if (message.codeBlock) metadata.codeBlock = message.codeBlock;
        if (message.sources) metadata.sources = message.sources;
        if (message.videoScript) metadata.videoScript = message.videoScript;

        // 3. Upsert message by client_id (prevents duplicates on re-save)
        const ct = message.contextType || 'chat';
        const clientId = message.id || null;
        const metadataJson = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '{}';

        if (clientId) {
            // Use upsert: INSERT ... ON CONFLICT (conversation_id, client_id) DO UPDATE
            await query(
                `INSERT INTO public.ai_messages (conversation_id, client_id, role, content, context_type, metadata, ordinal)
                 VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(ordinal), 0) + 1 FROM public.ai_messages WHERE conversation_id = $1))
                 ON CONFLICT (conversation_id, client_id) WHERE client_id IS NOT NULL
                 DO UPDATE SET content = EXCLUDED.content,
                               metadata = EXCLUDED.metadata,
                               context_type = EXCLUDED.context_type`,
                [conversationId, clientId, message.role, message.content || '', ct, metadataJson]
            );
        } else {
            // No client_id, just insert (legacy behavior)
            await query(
                `INSERT INTO public.ai_messages (conversation_id, role, content, context_type, metadata, ordinal)
                 VALUES ($1, $2, $3, $4, $5, (SELECT COALESCE(MAX(ordinal), 0) + 1 FROM public.ai_messages WHERE conversation_id = $1))`,
                [conversationId, message.role, message.content || '', ct, metadataJson]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Chat History POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/ai/chat/history
 *
 * Updates conversation metadata (e.g., concepts).
 * Body: {
 *   problemId: string,
 *   tabId: string,
 *   metadata: { concepts?: array, ... }
 * }
 */
export async function PATCH(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemId, tabId, metadata, aiCode } = body;

        if (!problemId || !tabId || (!metadata && aiCode === undefined)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (aiCode !== undefined) {
            // Upsert conversation to include aiCode in metadata
            await query(
                `INSERT INTO public.ai_conversations (user_id, context_id, context_type, tab_id, metadata, updated_at)
                 VALUES ($1, $2, 'problem', $3, jsonb_build_object('aiCode', $4::jsonb), NOW())
                 ON CONFLICT (user_id, context_id, context_type, tab_id)
                 DO UPDATE SET metadata = jsonb_set(COALESCE(public.ai_conversations.metadata, '{}'::jsonb), '{aiCode}', $4::jsonb),
                               updated_at = NOW()`,
                [user.id, problemId, tabId, JSON.stringify(aiCode)]
            );
        }

        if (metadata) {
            // Update conversation metadata (merge with existing)
            await query(
                `UPDATE public.ai_conversations
                 SET metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb,
                     updated_at = NOW()
                 WHERE user_id = $1 AND context_id = $2 AND context_type = 'problem' AND tab_id = $3`,
                [user.id, problemId, tabId, JSON.stringify(metadata)]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Chat History PATCH Error]', error);
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
             WHERE user_id = $1 AND context_id = $2 AND context_type = 'problem' AND tab_id = $3`,
            [user.id, problemId, tabId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Chat History DELETE Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
