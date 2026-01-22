import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET: Fetch current privacy settings
export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await query(
            `SELECT show_on_cf_leaderboard, show_on_sheets_leaderboard, show_public_profile 
             FROM users WHERE id = $1`,
            [user.id]
        );

        const row = result.rows[0] || {};
        return NextResponse.json({
            success: true,
            showOnCfLeaderboard: row.show_on_cf_leaderboard ?? true,
            showOnSheetsLeaderboard: row.show_on_sheets_leaderboard ?? true,
            showPublicProfile: row.show_public_profile ?? true,
        });

    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Update privacy settings
export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Support both old format (visibility: 'public'/'private') and new format (individual toggles)
        if (body.visibility !== undefined) {
            // Legacy: single visibility toggle
            const isPublic = body.visibility === 'public';
            await query(
                `UPDATE users SET 
                    profile_visibility = $1,
                    show_on_cf_leaderboard = $2,
                    show_on_sheets_leaderboard = $2,
                    show_public_profile = $2
                 WHERE id = $3`,
                [body.visibility, isPublic, user.id]
            );
            return NextResponse.json({ success: true, visibility: body.visibility });
        }

        // New: individual toggles
        const { showOnCfLeaderboard, showOnSheetsLeaderboard, showPublicProfile } = body;

        const updates: string[] = [];
        const values: (boolean | number)[] = [];
        let paramIndex = 1;

        if (typeof showOnCfLeaderboard === 'boolean') {
            updates.push(`show_on_cf_leaderboard = $${paramIndex++}`);
            values.push(showOnCfLeaderboard);
        }
        if (typeof showOnSheetsLeaderboard === 'boolean') {
            updates.push(`show_on_sheets_leaderboard = $${paramIndex++}`);
            values.push(showOnSheetsLeaderboard);
        }
        if (typeof showPublicProfile === 'boolean') {
            updates.push(`show_public_profile = $${paramIndex++}`);
            values.push(showPublicProfile);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 });
        }

        values.push(user.id);
        await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating privacy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

