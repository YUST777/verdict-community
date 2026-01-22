import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY;

interface JWTPayload {
    id: number;
    email: string;
    userId: number;
}

export async function POST(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        if (!JWT_SECRET) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify token
        let decoded: JWTPayload;
        try {
            decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const userId = decoded.id || decoded.userId;
        const body = await request.json();
        const { field } = body; // 'telegram' or 'codeforces'

        if (!field || !['telegram', 'codeforces'].includes(field)) {
            return NextResponse.json({ error: 'Invalid field. Use "telegram" or "codeforces".' }, { status: 400 });
        }

        // Get user to find application_id
        const userResult = await query('SELECT application_id FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const applicationId = userResult.rows[0].application_id;

        if (field === 'telegram') {
            // Clear telegram_username from users table
            await query('UPDATE users SET telegram_username = NULL WHERE id = $1', [userId]);
            // Clear from applications if exists
            if (applicationId) {
                await query('UPDATE applications SET telegram_username = NULL WHERE id = $1', [applicationId]);
            }
        } else if (field === 'codeforces') {
            // Clear codeforces data from users table
            await query('UPDATE users SET codeforces_handle = NULL, codeforces_data = NULL WHERE id = $1', [userId]);
            // Clear from applications if exists
            if (applicationId) {
                await query('UPDATE applications SET codeforces_profile = NULL, codeforces_data = NULL WHERE id = $1', [applicationId]);
            }
        }

        return NextResponse.json({ success: true, message: `${field} data deleted successfully` });
    } catch (error) {
        console.error('Error deleting profile data:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
