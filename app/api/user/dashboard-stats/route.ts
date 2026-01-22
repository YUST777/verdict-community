import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

interface JWTPayload {
    id: number;
    email: string;
    userId: number;
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        let decoded: JWTPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.id || decoded.userId;

        // Fetch solved problems from training_submissions (the correct table)
        const result = await query(
            `SELECT DISTINCT ON (sheet_id, problem_id)
                sheet_id, 
                problem_id, 
                submitted_at
             FROM training_submissions
             WHERE user_id = $1 AND verdict = 'Accepted'
             ORDER BY sheet_id, problem_id, submitted_at ASC`,
            [userId]
        );

        interface SubmissionRow {
            sheet_id: string;
            problem_id: string;
            submitted_at: string;
        }
        const submissions = result.rows.map((row: SubmissionRow) => ({
            sheet_name: row.sheet_id === 'sheet-1' ? 'Sheet 1' : row.sheet_id,
            problem_name: row.problem_id,
            submitted_at: row.submitted_at
        }));

        // --- Calculate Stats ---

        // 1. Total Problems Solved (Unique problems)
        const totalSolved = submissions.length;

        // 2. Streak Calculation
        const uniqueDates = Array.from(new Set(submissions.map((s) => {
            const date = new Date(s.submitted_at);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        }))).sort().reverse() as string[]; // Newest first

        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // Check if user solved something today or yesterday to start the streak
        let currentDateCheck = today;
        if (!uniqueDates.includes(today)) {
            if (uniqueDates.includes(yesterday)) {
                currentDateCheck = yesterday;
            } else {
                // Streak broken if not solved yesterday either
                streak = 0;
            }
        }

        if (uniqueDates.includes(currentDateCheck)) {
            streak = 1;
            const checkDate = new Date(currentDateCheck);

            // Iterate backwards
            for (let i = 1; i < uniqueDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                const checkString = checkDate.toISOString().split('T')[0];

                if (uniqueDates.includes(checkString)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        // 3. Consistency Data (for heatmap)
        const consistencyMap: Record<string, number> = {};
        submissions.forEach((s) => {
            const date = new Date(s.submitted_at).toISOString().split('T')[0];
            consistencyMap[date] = (consistencyMap[date] || 0) + 1;
        });

        return NextResponse.json({
            streak,
            totalSolved,
            consistencyMap,
            quiz1Solved: 0,
            isQuiz1Complete: false,
            approvalProgress: 0
        });

    } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
