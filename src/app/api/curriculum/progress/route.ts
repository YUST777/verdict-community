import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { query } from '@/lib/db';
import { icpchueQuery } from '@/lib/icpchue_db';
import { curriculum } from '@/lib/curriculum';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

export async function GET(req: NextRequest) {
    try {
        // Get user from token
        const token = req.cookies.get('authToken')?.value;
        if (!token || !JWT_SECRET) {
            const progress: Record<string, { solved: number; total: number }> = {};
            for (const level of curriculum) {
                progress[level.slug] = { solved: 0, total: level.totalProblems };
            }
            return NextResponse.json({ progress });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
            userId = decoded.id;
        } catch {
            const progress: Record<string, { solved: number; total: number }> = {};
            for (const level of curriculum) {
                progress[level.slug] = { solved: 0, total: level.totalProblems };
            }
            return NextResponse.json({ progress });
        }

        // Fetch user's university and email
        const userResult = await query('SELECT email, university_id, original_id FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ progress: {} });
        }
        const user = userResult.rows[0];

        // Build progress from static curriculum + DB submissions
        const progress: Record<string, { solved: number; total: number }> = {};
        for (const level of curriculum) {
            progress[level.slug] = { solved: 0, total: level.totalProblems };
        }

        // Set to track unique solved problems across both DBs (level_slug:sheet_id:problem_id)
        const solvedProblems = new Set<string>();

        // 1. Get solved problems from Verdict DB
        try {
            const verdictResult = await query(`
                SELECT sheet_id, problem_id
                FROM public.user_progress
                WHERE user_id = $1 AND status = 'SOLVED'
            `, [userId]);

            for (const row of verdictResult.rows) {
                solvedProblems.add(`verdict:${row.sheet_id}:${row.problem_id}`);
            }
        } catch (err) {
            console.error('Verdict DB progress fetch failed:', err);
        }

        // 2. If HUE university (ID: 1), fetch from ICPC HUE DB
        if (Number(user.university_id) === 1 && user.original_id) {
            try {
                const hueUserId = user.original_id;
                    
                    const hueProgressResult = await icpchueQuery(`
                        SELECT sheet_id, problem_id
                        FROM public.user_progress
                        WHERE user_id = $1 AND status = 'SOLVED'
                    `, [hueUserId]);

                    for (const row of hueProgressResult.rows) {
                        solvedProblems.add(`hue:${row.sheet_id}:${row.problem_id}`);
                    }
            } catch (err) {
                console.error('ICPC HUE DB progress fetch failed:', err);
            }
        }

        // 3. Map unique solved problems to progress object
        const uniqueSolvedByLevel = new Set<string>(); // levelSlug:contestId:problemLetter

        for (const solveKey of solvedProblems) {
            const parts = solveKey.split(':'); // source:sheetId:problem_id
            if (parts.length < 3) continue;

            const source = parts[0];
            const sheetId = parts[1];
            // The rest of the string is the problem_id, which might contain colons or dashes
            const problemIdRaw = parts.slice(2).join(':');
            const problemParts = problemIdRaw.split(/[:\-]/);
            
            const contestId = problemParts[0];
            const problemLetter = problemParts[1];

            if (!contestId || !problemLetter) continue;

            for (const level of curriculum) {
                const sheet = level.sheets.find(s => s.contestId === contestId);
                if (sheet) {
                    uniqueSolvedByLevel.add(`${level.slug}:${contestId}:${problemLetter}`);
                    break;
                }
            }
        }

        // Count unique problems per level
        for (const problemKey of uniqueSolvedByLevel) {
            const levelSlug = problemKey.split(':')[0];
            if (progress[levelSlug]) {
                progress[levelSlug].solved += 1;
            }
        }

        return NextResponse.json({ progress });
    } catch (err) {
        console.error('Failed to fetch curriculum progress:', err);
        return NextResponse.json({ progress: {} });
    }
}
