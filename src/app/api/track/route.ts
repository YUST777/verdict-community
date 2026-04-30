import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';
import { query } from '@/lib/db';

const VALID_ACTIONS = new Set([
    'problem_view', 'tab_switch', 'code_run', 'code_submit',
    'submission_view', 'solution_view', 'notes_open', 'notes_save',
    'whiteboard_open', 'settings_open', 'language_change',
    'drawer_open', 'handle_save', 'code_copy', 'code_paste',
    'fullscreen_toggle', 'keyboard_shortcut', 'analytics_view',
    'test_add', 'test_delete', 'export_snippet', 'page_leave',
    'tab_hidden', 'tab_visible', 'window_blur', 'window_focus',
    'text_copy', 'user_idle', 'heartbeat', 'problem_leave',
    'context_menu', 'scroll_depth', 'code_change', 'editor_selection',
    'resize_window', 'mouse_idle_zone', 'error_encounter',
    'submission_result', 'test_result', 'code_restore',
    'devtools_open', 'print_attempt',
    'session_start', 'session_end',
    'connection_online', 'connection_offline',
]);

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ ok: false }, { status: 401 });

        if (!checkRateLimit(`track:${user.id}`, 120, 60)) {
            return NextResponse.json({ ok: false }, { status: 429 });
        }

        let body;
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            body = await req.json();
        } else {
            const text = await req.text();
            body = JSON.parse(text);
        }

        const { action, contestId, problemId, sheetId, metadata, sessionId } = body;

        if (!action || !VALID_ACTIONS.has(action)) {
            return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
        }

        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
        const ua = req.headers.get('user-agent') || null;

        // Insert directly into user_activity (no Redis buffer needed for now)
        query(
            `INSERT INTO user_activity (user_id, session_id, action, contest_id, problem_id, sheet_id, metadata, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [user.id, sessionId || '', action, contestId || null, problemId || null, sheetId || null, JSON.stringify(metadata || {}), ip, ua]
        ).catch(() => {});

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
