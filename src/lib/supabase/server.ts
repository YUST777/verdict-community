import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const isLocalhost = process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');
    const cookieDomain = isLocalhost ? undefined : '.verdict.run';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { }
                },
            },
            cookieOptions: {
                domain: cookieDomain,
                path: '/',
                sameSite: 'lax',
                secure: !isLocalhost,
            }
        }
    )
}
