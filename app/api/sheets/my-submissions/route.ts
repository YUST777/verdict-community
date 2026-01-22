import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get solved problems from training_submissions (Accepted verdicts only)
        const result = await query(
            `SELECT DISTINCT ON (sheet_id, problem_id)
                sheet_id, 
                problem_id, 
                submitted_at
             FROM training_submissions
             WHERE user_id = $1 AND verdict = 'Accepted'
             ORDER BY sheet_id, problem_id, submitted_at ASC`,
            [user.id]
        );

        // Format to match what dashboard expects
        const submissions = result.rows.map((row: { sheet_id: string; problem_id: string; submitted_at: string }) => ({
            sheet_name: row.sheet_id === 'sheet-1' ? 'Sheet 1' : row.sheet_id,
            problem_name: row.problem_id,
            submitted_at: row.submitted_at
        }));

        return NextResponse.json({
            success: true,
            submissions,
            total: submissions.length
        });

    } catch (error) {
        console.error('Error getting submissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
