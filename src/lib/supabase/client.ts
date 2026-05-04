import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const isLocalhost = typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost'
    : process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');
  const cookieDomain = isLocalhost ? undefined : '.verdict.run';

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: 'lax',
        secure: !isLocalhost,
      }
    }
  )
}

