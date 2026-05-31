import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const isLocalhost = typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost'
    : process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');
  const cookieDomain = isLocalhost ? undefined : '.verdict.run';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
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

