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

/**
 * GET /api/user/sheets
 * 
 * Query params:
 *   ?contestId=123  — return just that contest's sheet (or null)
 *   (no param)      — return the full sheets map { [contestId]: SheetData }
 */
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            'SELECT sheet FROM user_sheets WHERE user_id = $1',
            [user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ data: null });
        }

        const stored = result.rows[0].sheet;

        // Handle legacy format: single sheet object with `problems` array
        // Convert to new map format on the fly
        if (stored && stored.problems && Array.isArray(stored.problems)) {
            // Legacy single-sheet format — wrap it in a map
            const contestId = stored.contestId || 'unknown';
            const sheetsMap: Record<string, SheetData> = { [contestId]: stored };

            // Migrate in background (fire and forget)
            query(
                `UPDATE user_sheets SET sheet = $1, updated_at = NOW() WHERE user_id = $2`,
                [JSON.stringify(sheetsMap), user.id]
            ).catch(() => {});

            const requestedId = req.nextUrl.searchParams.get('contestId');
            if (requestedId) {
                return NextResponse.json({ data: sheetsMap[requestedId] || null });
            }
            return NextResponse.json({ data: sheetsMap });
        }

        // New map format: { [contestId]: SheetData }
        const sheetsMap: Record<string, SheetData> = stored || {};
        const requestedId = req.nextUrl.searchParams.get('contestId');

        if (requestedId) {
            return NextResponse.json({ data: sheetsMap[requestedId] || null });
        }

        return NextResponse.json({ data: sheetsMap });
    } catch (error) {
        console.error('[User Sheets GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/user/sheets
 * Body: { sheet: SheetData }
 * 
 * Merges this sheet into the stored map keyed by sheet.contestId.
 * Keeps up to 50 most recent sheets (LRU eviction).
 */
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { sheet } = body;

        if (!sheet || typeof sheet !== 'object' || !sheet.contestId) {
            return NextResponse.json({ error: 'Invalid sheet format' }, { status: 400 });
        }

        // Load existing map
        const existing = await query(
            'SELECT sheet FROM user_sheets WHERE user_id = $1',
            [user.id]
        );

        let sheetsMap: Record<string, SheetData> = {};

        if (existing.rows.length > 0) {
            const stored = existing.rows[0].sheet;
            if (stored && stored.problems && Array.isArray(stored.problems)) {
                // Legacy single-sheet — convert
                const cid = stored.contestId || 'unknown';
                sheetsMap = { [cid]: stored };
            } else if (stored && typeof stored === 'object') {
                sheetsMap = stored;
            }
        }

        // Merge the new sheet
        sheetsMap[sheet.contestId] = sheet;

        // LRU eviction: keep only 50 most recent sheets
        const entries = Object.entries(sheetsMap);
        if (entries.length > 50) {
            entries.sort((a, b) => {
                const timeA = new Date(a[1].lastAccessedAt || 0).getTime();
                const timeB = new Date(b[1].lastAccessedAt || 0).getTime();
                return timeB - timeA; // newest first
            });
            sheetsMap = Object.fromEntries(entries.slice(0, 50));
        }

        await query(`
            INSERT INTO user_sheets (user_id, sheet, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET
                sheet = EXCLUDED.sheet,
                updated_at = NOW();
        `, [user.id, JSON.stringify(sheetsMap)]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[User Sheets POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
