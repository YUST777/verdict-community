-- Enable RLS on valid tables
ALTER TABLE IF EXISTS public.training_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.api_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sheet_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.website_analytics ENABLE ROW LEVEL SECURITY;
-- POLICY STRATEGY:
-- 1. The Next.js application connects via a connection pool using specific credentials (service_role or postgres).
--    These roles typically have BYPASSRLS or should be granted full access.
-- 2. The Linter errors indicate these tables are visible to PostgREST (API layer). 
--    We want to block public access via PostgREST but allow the backend app to function.
-- Grant full access to 'service_role' and 'postgres' (Standard Supabase Internal Roles)
-- This ensures the Node.js backend continues to work regardless of RLS.
DO $$
DECLARE t text;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'training_submissions',
        'api_access_log',
        'applications',
        'login_logs',
        'password_resets',
        'sheet_submissions',
        'users',
        'website_analytics'
    ) LOOP -- Drop existing policies to avoid conflicts
    EXECUTE format(
        'DROP POLICY IF EXISTS "Enable all for service_role" ON %I',
        t
    );
-- Create permissive policy for internal usage
EXECUTE format(
    'CREATE POLICY "Enable all for service_role" ON %I USING (auth.role() = ''service_role'' OR current_user = ''postgres'') WITH CHECK (auth.role() = ''service_role'' OR current_user = ''postgres'')',
    t
);
-- Explicitly DENY public/anon access by NOT creating a policy for them
-- (RLS default is Deny All if no policy matches)
END LOOP;
END $$;
-- Specific Policies for PostgREST (if you intend to use clientside supabase-js in future)
-- For now, we rely on the internal backend, so 'Deny All' for public is the safest default 
-- to satisfy the security warning without exposing data.