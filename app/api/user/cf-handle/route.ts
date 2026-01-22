import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { extractUsername } from '@/lib/codeforces';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            // Return null handle instead of error for unauthenticated users
            return NextResponse.json({ handle: null });
        }

        // Get user's codeforces_handle from users table
        const userResult = await query('SELECT codeforces_handle FROM users WHERE id = $1', [user.id]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ handle: null });
        }

        const cfHandle = userResult.rows[0].codeforces_handle;
        if (!cfHandle) {
            return NextResponse.json({ handle: null });
        }

        // Extract username from handle (could be URL or just handle)
        const username = extractUsername(cfHandle, 'codeforces') || cfHandle;

        return NextResponse.json({ handle: username });

    } catch (error) {
        console.error('Error fetching CF handle:', error);
        // Return null handle instead of error
        return NextResponse.json({ handle: null });
    }
}

