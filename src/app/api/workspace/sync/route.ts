import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

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

        const result = await query(
            'SELECT saved_code, selected_language, custom_test_cases, whiteboard_data, ai_chat_messages, ai_chat_tabs, ai_chat_concepts, ai_chat_inputs FROM user_workspaces WHERE user_id = $1 AND problem_id = $2',
            [user.id, problemId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ data: null });
        }

        return NextResponse.json({ data: result.rows[0] });
    } catch (error) {
        console.error('[Workspace GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            problemId, savedCode, selectedLanguage, customTestCases, whiteboardData,
            aiChatMessages, aiChatTabs, aiChatConcepts, aiChatInput
        } = body;

        if (!problemId) {
            return NextResponse.json({ error: 'Missing problemId' }, { status: 400 });
        }

        // Upsert into user_workspaces using DB's COALESCE to keep unprovided fields intact
        const queryText = `
            INSERT INTO user_workspaces (
                user_id, problem_id, saved_code, selected_language, custom_test_cases, 
                whiteboard_data, ai_chat_messages, ai_chat_tabs, ai_chat_concepts, ai_chat_inputs, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            ON CONFLICT (user_id, problem_id) 
            DO UPDATE SET 
                saved_code = COALESCE(EXCLUDED.saved_code, user_workspaces.saved_code),
                selected_language = COALESCE(EXCLUDED.selected_language, user_workspaces.selected_language),
                custom_test_cases = COALESCE(EXCLUDED.custom_test_cases, user_workspaces.custom_test_cases),
                whiteboard_data = COALESCE(EXCLUDED.whiteboard_data, user_workspaces.whiteboard_data),
                ai_chat_messages = COALESCE(EXCLUDED.ai_chat_messages, user_workspaces.ai_chat_messages),
                ai_chat_tabs = COALESCE(EXCLUDED.ai_chat_tabs, user_workspaces.ai_chat_tabs),
                ai_chat_concepts = COALESCE(EXCLUDED.ai_chat_concepts, user_workspaces.ai_chat_concepts),
                ai_chat_inputs = COALESCE(EXCLUDED.ai_chat_inputs, user_workspaces.ai_chat_inputs),
                updated_at = NOW();
        `;

        await query(queryText, [
            user.id,
            problemId,
            savedCode !== undefined ? savedCode : null,
            selectedLanguage !== undefined ? selectedLanguage : null,
            customTestCases !== undefined ? JSON.stringify(customTestCases) : null,
            whiteboardData !== undefined ? JSON.stringify(whiteboardData) : null,
            aiChatMessages !== undefined ? JSON.stringify(aiChatMessages) : null,
            aiChatTabs !== undefined ? JSON.stringify(aiChatTabs) : null,
            aiChatConcepts !== undefined ? JSON.stringify(aiChatConcepts) : null,
            aiChatInput !== undefined ? JSON.stringify(aiChatInput) : null
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Workspace POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
