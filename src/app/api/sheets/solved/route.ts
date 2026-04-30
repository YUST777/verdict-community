import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * GET /api/sheets/solved?sheetId=X&contestId=Y
 * Returns the list of solved problem letters for a sheet.
 */
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const sheetId = searchParams.get('sheetId');
        const contestId = searchParams.get('contestId');

        if (!sheetId && !contestId) {
            return NextResponse.json({ error: 'sheetId or contestId required' }, { status: 400 });
        }

        // Check training_submissions for accepted verdicts
        let solvedIds: string[] = [];

        if (sheetId) {
            const result = await query(
                `SELECT DISTINCT problem_id FROM training_submissions
                 WHERE user_id = $1 AND sheet_id = $2 AND (verdict = 'Accepted' OR status = 'AC')`,
                [user.id, sheetId]
            );
            solvedIds = result.rows.map((r: any) => r.problem_id);
        }

        // Also check user_progress table if it exists
        if (contestId) {
            try {
                const result = await query(
                    `SELECT problem_id FROM user_progress
                     WHERE user_id = $1 AND status = 'SOLVED' AND problem_id LIKE $2`,
                    [user.id, `${contestId}:%`]
                );
                const progressIds = result.rows.map((r: any) => {
                    const parts = r.problem_id.split(':');
                    return parts[parts.length - 1];
                });
                solvedIds = [...new Set([...solvedIds, ...progressIds])];
            } catch {
                // user_progress table may not exist
            }
        }

        return NextResponse.json({ success: true, solvedIds });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
