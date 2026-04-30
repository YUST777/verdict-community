import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { curriculum } from '@/lib/curriculum';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

export async function GET(req: NextRequest) {
    try {
        // Get user from token
        const token = req.cookies.get('authToken')?.value;
        if (!token || !JWT_SECRET) {
            // Return static totals with 0 solved for guests
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

        // Build progress from static curriculum + DB submissions
        const progress: Record<string, { solved: number; total: number }> = {};

        // Initialize from static data
        for (const level of curriculum) {
            progress[level.slug] = { solved: 0, total: level.totalProblems };
        }

        // Try to get solved counts from DB
        try {
            const result = await query(`
                SELECT sheet_id, COUNT(DISTINCT problem_id) as solved
                FROM training_submissions
                WHERE user_id = $1 AND (verdict = 'Accepted' OR status = 'AC')
                GROUP BY sheet_id
            `, [userId]);

            // Map sheet_id back to level slug
            for (const row of result.rows) {
                const sheetId = row.sheet_id;
                for (const level of curriculum) {
                    if (level.sheets.some(s => s.id === sheetId)) {
                        progress[level.slug].solved += parseInt(row.solved) || 0;
                        break;
                    }
                }
            }
        } catch {
            // DB may not have the table yet — return 0 solved
        }

        return NextResponse.json({ progress });
    } catch (err) {
        console.error('Failed to fetch curriculum progress:', err);
        return NextResponse.json({ progress: {} });
    }
}
