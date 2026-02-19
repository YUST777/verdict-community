import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';
import { decrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);

        if (!user) {
            return NextResponse.json(
                { authenticated: false, user: null },
                { status: 401 }
            );
        }

        // Fetch additional user details from database
        const userResult = await query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [user.id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { authenticated: false, user: null },
                { status: 401 }
            );
        }

        const dbUser = userResult.rows[0];

        // Decrypt email if encrypted
        let email = user.email;
        try {
            const decrypted = decrypt(dbUser.email);
            if (decrypted) email = decrypted;
        } catch {
            // Email might not be encrypted (legacy)
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: email,
                createdAt: dbUser.created_at
            }
        });
    } catch (error) {
        console.error('[Auth Me Error]', error);
        return NextResponse.json(
            { authenticated: false, user: null, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
