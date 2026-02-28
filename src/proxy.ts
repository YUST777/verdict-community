import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Simple in-memory rate limiter (per instance)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute per IP

export async function proxy(request: NextRequest) {
    const supabaseResponse = await updateSession(request);
    const response = supabaseResponse;
    const headers = response.headers;

    // --- 1. Security Headers ---
    headers.set('X-DNS-Prefetch-Control', 'on');
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // CSP - Next.js requires unsafe-inline and unsafe-eval for dev, WASM needs wasm-unsafe-eval for 3D models
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: blob:; media-src 'self' https: blob: data:; frame-src 'self' https://drive.google.com https://www.youtube.com https://accounts.google.com https://*.supabase.co; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;");

    // --- 2. Bot Blocking ---
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    const allowedBots = ['googlebot', 'bingbot', 'applebot', 'yandexbot', 'duckduckbot', 'baiduspider', 'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot'];
    const isLegitimateBot = allowedBots.some(bot => userAgent.includes(bot));

    const blockedAgents = ['python-requests', 'libwww-perl', 'scrapy'];

    if (!isLegitimateBot && blockedAgents.some(agent => userAgent.includes(agent))) {
        // Next.js 16 proxy cannot return response bodies. 
        // We'll return a status code only or rewrite to an error page.
        return new NextResponse(null, { status: 403, statusText: 'Access Denied: Suspicious User Agent' });
    }

    // --- 3. Basic Rate Limiting ---
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (ip !== 'unknown') {
        const now = Date.now();
        const limitData = rateLimitMap.get(ip);

        if (limitData) {
            if (now < limitData.resetTime) {
                if (limitData.count >= MAX_REQUESTS) {
                    return new NextResponse(null, { status: 429, statusText: 'Too Many Requests' });
                }
                limitData.count++;
            } else {
                rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_SIZE });
            }
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_SIZE });
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|glb|woff2?|map|css|js)).*)',
    ],
};
