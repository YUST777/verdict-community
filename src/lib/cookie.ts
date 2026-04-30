/**
 * Shared cookie configuration for auth tokens.
 * Handles localhost vs production automatically.
 */

function isLocalhost(): boolean {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    return siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
}

export function getAuthCookieOptions(): {
    path: string;
    maxAge: number;
    sameSite: 'lax';
    httpOnly: true;
    secure: boolean;
    domain?: string;
} {
    const isLocal = isLocalhost();

    return {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
        httpOnly: true,
        secure: !isLocal,
        ...(isLocal ? {} : { domain: process.env.COOKIE_DOMAIN || '.verdict.run' }),
    };
}
