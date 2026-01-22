import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// Smart endpoint: Returns ONLY the list of solved problem IDs for a sheet
// Much more efficient than fetching all submissions
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const sheetId = searchParams.get('sheetId');

        if (!sheetId) {
            return NextResponse.json({ error: 'sheetId is required' }, { status: 400 });
        }

        // Single efficient query - just gets distinct problem IDs with Accepted verdict
        const result = await query(
            `SELECT DISTINCT problem_id 
             FROM training_submissions 
             WHERE user_id = $1 
               AND sheet_id = $2 
               AND verdict = 'Accepted'`,
            [user.id, sheetId]
        );

        // Return just the array of problem IDs
        const solvedProblemIds = result.rows.map((row: { problem_id: string }) => row.problem_id);

        return NextResponse.json({
            success: true,
            solvedProblemIds
        });

    } catch (error) {
        console.error('Error fetching solved problems:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
