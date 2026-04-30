
CREATE TABLE IF NOT EXISTS public.ai_solutions (
    id bigserial PRIMARY KEY,

    -- Problem identity
    problem_id text NOT NULL,                    -- e.g. "1950-E"
    contest_id integer,
    problem_index text,                          -- e.g. "E"
    problem_name text,
    problem_rating integer,
    problem_tags text[],                         -- e.g. {"dp","graphs"}

    -- Solution
    solution_code text NOT NULL,
    language text NOT NULL DEFAULT 'cpp',         -- cpp, python, java, etc.
    solution_style text NOT NULL DEFAULT 'smart', -- 'simple' or 'smart'

    -- AI metadata
    llm_model text,                              -- e.g. "gpt-4o", "claude-sonnet"
    llm_provider text,                           -- e.g. "openai", "anthropic"
    thinking text,                               -- AI's reasoning/analysis
    approach text,                               -- brief approach description
    explanation text,                            -- full explanation

    -- Judge results (per attempt)
    attempts jsonb NOT NULL DEFAULT '[]',
    /*
      Each attempt:
      {
        "attempt": 1,
        "verdict": "Accepted" | "Wrong Answer" | ...,
        "passed": true/false,
        "tests_passed": 3,
        "tests_total": 4,
        "time_ms": 46,
        "memory_kb": 3584,
        "compile_error": null,
        "runtime_error": null,
        "fuzz_tested": true/false,
        "fuzz_passed": true/false,
        "fuzz_failing_input": null
      }
    */

    -- Aggregated stats
    total_attempts integer NOT NULL DEFAULT 1,
    successful_attempt integer,                   -- which attempt # passed (null = never)
    total_wall_time_ms integer,                   -- end-to-end time from click to done

    -- Reference solution
    had_reference boolean NOT NULL DEFAULT false,
    reference_code text,

    -- User (anonymized for dataset — just the id for dedup)
    user_id integer REFERENCES users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for dataset queries
CREATE INDEX IF NOT EXISTS idx_ai_solutions_problem ON public.ai_solutions(problem_id);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_rating ON public.ai_solutions(problem_rating);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_model ON public.ai_solutions(llm_model);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_created ON public.ai_solutions(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_style ON public.ai_solutions(solution_style);
