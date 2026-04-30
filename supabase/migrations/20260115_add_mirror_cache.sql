CREATE TABLE IF NOT EXISTS public.mirror_problems (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contest_id text NOT NULL,
    problem_index text NOT NULL,
    data jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(contest_id, problem_index)
);
CREATE TABLE IF NOT EXISTS public.mirror_views (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contest_id text NOT NULL,
    problem_index text NOT NULL,
    user_id bigint REFERENCES public.users(id) ON DELETE
    SET NULL,
        viewed_at timestamp with time zone DEFAULT now()
);
-- Index for fast lookup
CREATE INDEX idx_mirror_problems_lookup ON public.mirror_problems(contest_id, problem_index);