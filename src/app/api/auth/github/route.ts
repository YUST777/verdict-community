import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const returnUrl = req.nextUrl.searchParams.get('returnUrl');
    
    // Build callback URL with optional returnUrl
    let callbackUrl = `${baseUrl}/api/auth/callback`;
    if (returnUrl) {
        callbackUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    try {
        const response = NextResponse.redirect(baseUrl);
        
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return req.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: callbackUrl,
            },
        });

        if (error) {
            console.error('[GitHub OAuth] Error:', error);
            return NextResponse.redirect(new URL('/register?error=oauth_failed', baseUrl));
        }

        if (data?.url) {
            return NextResponse.redirect(data.url);
        }

        return NextResponse.redirect(new URL('/register?error=no_oauth_url', baseUrl));
    } catch (err) {
        console.error('[GitHub OAuth] Exception:', err);
        return NextResponse.redirect(new URL('/register?error=oauth_error', baseUrl));
    }
}
