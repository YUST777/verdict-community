-- Create submissions table for persistent submission history + AI dataset
CREATE TABLE IF NOT EXISTS submissions (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         bigint NOT NULL,
    contest_id      text NOT NULL,
    problem_index   text NOT NULL,
    source_code     text NOT NULL,
    language        text NOT NULL,
    cf_submission_id bigint,
    verdict         text NOT NULL,
    time_ms         integer,
    memory_kb       integer,
    passed_test_count integer,
    problem_rating  integer,
    problem_tags    text[],
    problem_name    text,
    created_at      timestamptz DEFAULT now()
);

-- Fast lookups: user's submissions for a problem
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, contest_id, problem_index);

-- Dedup index: prevent duplicate CF submissions
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_cf_id_user ON submissions(cf_submission_id, user_id) WHERE cf_submission_id IS NOT NULL;

-- Dataset queries: find all accepted/wrong answer submissions
CREATE INDEX IF NOT EXISTS idx_submissions_verdict ON submissions(verdict);

-- Dataset queries: find submissions by rating range
CREATE INDEX IF NOT EXISTS idx_submissions_rating ON submissions(problem_rating) WHERE problem_rating IS NOT NULL;

-- Enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own submissions
CREATE POLICY submissions_select_own ON submissions FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::bigint);
CREATE POLICY submissions_insert_own ON submissions FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::bigint);

-- Grant access
GRANT SELECT, INSERT ON submissions TO authenticated;
GRANT SELECT, INSERT ON submissions TO anon;
