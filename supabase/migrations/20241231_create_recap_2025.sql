-- Create recap_2025 table to store pre-calculated recap data for all users
-- This is a snapshot of 2025 performance data
CREATE TABLE IF NOT EXISTS recap_2025 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    avatar_url TEXT,
    -- Stats
    days_active INTEGER DEFAULT 0,
    total_solved INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    top_problem TEXT,
    top_problem_attempts INTEGER DEFAULT 0,
    rank_percentile INTEGER DEFAULT 100,
    max_streak INTEGER DEFAULT 0,
    preferred_language TEXT DEFAULT 'C++',
    -- Tags and difficulty breakdown (stored as JSONB)
    top_tags JSONB DEFAULT '[]'::jsonb,
    difficulty_solved JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}'::jsonb,
    -- Achievements (stored as JSONB array)
    achievements JSONB DEFAULT '[]'::jsonb,
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create index for fast lookups by student_id
CREATE INDEX IF NOT EXISTS idx_recap_2025_student_id ON recap_2025(student_id);
-- Enable Row Level Security
ALTER TABLE recap_2025 ENABLE ROW LEVEL SECURITY;
-- Allow public read access (recap is publicly shareable)
CREATE POLICY "recap_2025_public_read" ON recap_2025 FOR
SELECT TO public USING (true);
-- Allow authenticated users to insert/update (for admin scripts)
CREATE POLICY "recap_2025_authenticated_write" ON recap_2025 FOR ALL TO authenticated USING (true) WITH CHECK (true);