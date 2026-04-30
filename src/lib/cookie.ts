/**
 * Shared cookie configuration for auth tokens.
 * Detects localhost from the runtime environment, not build-time env vars.
 */

export function getAuthCookieOptions(req?: { headers?: { get?: (name: string) => string | null } }): {
    path: string;
    maxAge: number;
    sameSite: 'lax';
    httpOnly: true;
    secure: boolean;
    domain?: string;
} {
    // Check request host at runtime (works in both dev and prod)
    let isLocal = false;
    if (req?.headers?.get) {
        const host = req.headers.get('host') || '';
        isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    } else {
        // Fallback: check env
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
        isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
    }

    return {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: !isLocal,
        ...(isLocal ? {} : { domain: process.env.COOKIE_DOMAIN || '.verdict.run' }),
    };
}
