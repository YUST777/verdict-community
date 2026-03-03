-- Verdict Database Initialization
-- Run this once during deployment to ensure all tables exist.
-- These CREATE TABLE IF NOT EXISTS statements were removed from API routes
-- for security (DDL in request handlers is dangerous).

CREATE TABLE IF NOT EXISTS user_sheets (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sheet JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tabs (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tabs JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure codeforces_handle column exists on users table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'codeforces_handle'
    ) THEN
        ALTER TABLE users ADD COLUMN codeforces_handle VARCHAR(255);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.video_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    script JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
