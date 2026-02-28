import { NextRequest } from 'next/server';
import crypto from 'crypto';

const CSRF_SECRET = process.env.JWT_SECRET || process.env.API_SECRET_KEY || 'csrf-fallback-secret';
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CSRFPayload {
    userId: string;
    timestamp: number;
    random: string;
}

/**
 * Generate a CSRF token for a user
 */
export function generateCSRFToken(userId: string): string {
    const payload: CSRFPayload = {
        userId,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
    };

    const data = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(data);
    const signature = hmac.digest('hex');

    // Base64 encode the payload + signature
    const token = Buffer.from(`${data}.${signature}`).toString('base64');
    return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string, userId: string): boolean {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [data, signature] = decoded.split('.');

        if (!data || !signature) {
            return false;
        }

        // Verify signature
        const hmac = crypto.createHmac('sha256', CSRF_SECRET);
        hmac.update(data);
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
            return false;
        }

        // Parse and validate payload
        const payload: CSRFPayload = JSON.parse(data);

        // Check user ID matches
        if (payload.userId !== userId) {
            return false;
        }

        // Check token hasn't expired
        if (Date.now() - payload.timestamp > CSRF_TOKEN_EXPIRY) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Extract CSRF token from request
 */
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
    // Check header first
    const headerToken = req.headers.get('x-csrf-token');
    if (headerToken) return headerToken;

    // Check cookie as fallback
    const cookieToken = req.cookies.get('csrf-token')?.value;
    if (cookieToken) return cookieToken;

    return null;
}

/**
 * Validate CSRF for a request (requires auth user)
 */
export function validateCSRF(req: NextRequest, userId: string): boolean {
    const token = getCSRFTokenFromRequest(req);
    if (!token) return false;
    return verifyCSRFToken(token, userId);
}
