import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY || '';

export interface AuthUser {
    id: number;
    email: string;
    userId?: number; // Legacy payload support
    applicationId?: number;
    role?: string;
}

export async function verifyAuth(req: NextRequest): Promise<AuthUser | null> {
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return null;
    }

    let token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        // Fallback to cookie
        const cookie = req.cookies.get('authToken');
        if (cookie) token = cookie.value;
    }

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as AuthUser; // Force non-null assertion since we checked above
        // Normalize ID (payload might have id or userId)
        return {
            ...decoded,
            id: decoded.id || decoded.userId || 0
        };
    } catch (error) {
        console.error('VERIFY ERROR:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Active Secret (First 5):', JWT_SECRET?.substring(0, 5));
        console.error('Token (First 10):', token.substring(0, 10));
        // Token expired or invalid
        return null;
    }
}
