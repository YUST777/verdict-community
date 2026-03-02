import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export interface SheetData {
    contestId: string;
    contestType: 'contest' | 'gym' | 'group';
    groupId?: string;
    problems: SheetProblem[];
    lastAccessedAt: string;
}

export interface SheetProblem {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags?: string[];
}

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await query(`
            CREATE TABLE IF NOT EXISTS user_sheets (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                sheet JSONB DEFAULT '{}'::jsonb,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        const result = await query(
            'SELECT sheet FROM user_sheets WHERE user_id = $1',
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ data: null });
        }

        return NextResponse.json({ data: result.rows[0].sheet || null });
    } catch (error) {
        console.error('[User Sheets GET Error]', error);
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
        const { sheet } = body;

        if (!sheet || typeof sheet !== 'object') {
            return NextResponse.json({ error: 'Invalid sheet format' }, { status: 400 });
        }

        await query(`
            CREATE TABLE IF NOT EXISTS user_sheets (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                sheet JSONB DEFAULT '{}'::jsonb,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await query(`
            INSERT INTO user_sheets (user_id, sheet, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                sheet = EXCLUDED.sheet,
                updated_at = NOW();
        `, [user.id, JSON.stringify(sheet)]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[User Sheets POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
