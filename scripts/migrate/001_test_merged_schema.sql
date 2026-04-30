-- ============================================================================
-- TEST MERGED DATABASE SCHEMA
-- Target: Supabase project rytpfqlvzcfthnavybwx (testing only)
-- Purpose: Unified schema that supports both ICPCHUE and Verdict users
-- WARNING: DO NOT run against production databases
-- ============================================================================

-- ============================================
-- 1. UNIVERSITIES TABLE (Verdict-specific)
-- ============================================
CREATE TABLE IF NOT EXISTS public.universities (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE,
    email_domain    TEXT NOT NULL UNIQUE,
    short_name      TEXT,
    type            TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'civil', 'special')),
    logo_url        TEXT,
    is_premium      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    member_count    INTEGER DEFAULT 0,
    total_solves    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    verified        BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_universities_domain ON public.universities(email_domain);
CREATE INDEX IF NOT EXISTS idx_universities_slug ON public.universities(slug);

-- ============================================
-- 2. UNIFIED USERS TABLE
-- Supports both ICPCHUE (Supabase Auth) and Verdict (JWT) login
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email                   TEXT NOT NULL UNIQUE,
    email_blind_index       TEXT UNIQUE,
    password_hash           TEXT NOT NULL,
    name                    TEXT,
    display_name            TEXT,
    username                TEXT UNIQUE,

    -- University linking (Verdict)
    university_id           INTEGER REFERENCES public.universities(id),
    university_slug         TEXT,
    faculty                 TEXT,
    student_level           TEXT,
    student_id_encrypted    TEXT,

    -- Auth provider tracking
    supabase_uid            UUID UNIQUE,          -- ICPCHUE uses Supabase Auth
    auth_id                 TEXT,                  -- Verdict OAuth (Google/GitHub)
    tier                    TEXT DEFAULT 'public', -- 'public' | 'university'
    is_email_verified       BOOLEAN DEFAULT FALSE,
    is_verified             BOOLEAN DEFAULT FALSE, -- ICPCHUE legacy

    -- Application link (both platforms)
    application_id          BIGINT,

    -- Profile
    profile_picture_url     TEXT,
    profile_picture         VARCHAR,
    telegram_username       TEXT,
    codeforces_handle       TEXT,
    codeforces_data         JSONB,
    leetcode_handle         TEXT,

    -- Role & permissions
    role                    TEXT DEFAULT 'member' CHECK (role IN ('member', 'trainee', 'ambassador', 'admin', 'owner', 'user')),
    is_university_verified  BOOLEAN DEFAULT FALSE,

    -- Privacy & moderation
    profile_visibility      TEXT DEFAULT 'public',
    show_on_leaderboard     BOOLEAN DEFAULT TRUE,
    show_on_cf_leaderboard  BOOLEAN DEFAULT TRUE,
    show_on_sheets_leaderboard BOOLEAN DEFAULT TRUE,
    show_public_profile     BOOLEAN DEFAULT TRUE,
    is_shadow_banned        BOOLEAN DEFAULT FALSE,
    cheating_flags          INTEGER DEFAULT 0,

    -- Timestamps
    last_login_at           TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),

    -- Source tracking for merged DB
    source_platform         TEXT DEFAULT 'verdict' CHECK (source_platform IN ('icpchue', 'verdict', 'both'))
);

CREATE INDEX IF NOT EXISTS idx_users_university ON public.users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_blind ON public.users(email_blind_index);
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON public.users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);

-- ============================================
-- 3. APPLICATIONS TABLE (both platforms)
-- ============================================
CREATE TABLE IF NOT EXISTS public.applications (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT REFERENCES public.users(id),
    university_id           INTEGER REFERENCES public.universities(id),
    application_type        TEXT DEFAULT 'trainee',
    status                  TEXT DEFAULT 'approved',
    name                    TEXT NOT NULL,
    faculty                 TEXT NOT NULL,
    student_id              TEXT NOT NULL,
    student_id_blind_index  TEXT,
    national_id             TEXT,
    national_id_blind_index TEXT,
    student_level           TEXT NOT NULL,
    telephone               TEXT NOT NULL,
    telephone_blind_index   TEXT,
    address                 TEXT,
    has_laptop              BOOLEAN DEFAULT FALSE,
    codeforces_profile      TEXT,
    codeforces_handle       TEXT,
    codeforces_data         JSONB,
    leetcode_profile        TEXT,
    leetcode_handle         TEXT,
    leetcode_data           JSONB,
    scraping_status         TEXT DEFAULT 'pending',
    email                   TEXT,
    email_hash              VARCHAR,
    email_blind_index       TEXT,
    ip_address              TEXT,
    user_agent              TEXT,
    telegram_username       TEXT,
    submitted_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_email_blind ON public.applications(email_blind_index);
CREATE INDEX IF NOT EXISTS idx_applications_student_blind ON public.applications(student_id_blind_index);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);

-- Add FK from users to applications
ALTER TABLE public.users ADD CONSTRAINT users_application_id_fkey
    FOREIGN KEY (application_id) REFERENCES public.applications(id);


-- ============================================
-- 4. EMAIL VERIFICATION OTPs
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_verification_otps (
    email               VARCHAR NOT NULL PRIMARY KEY,
    email_blind_index   TEXT,
    otp_code            VARCHAR NOT NULL,
    expires_at          TIMESTAMPTZ NOT NULL,
    attempts            INTEGER DEFAULT 0,
    verified_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. UNIVERSITY ROOMS
-- ============================================
CREATE TABLE IF NOT EXISTS public.university_rooms (
    id              SERIAL PRIMARY KEY,
    university_id   INTEGER UNIQUE REFERENCES public.universities(id) ON DELETE CASCADE,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    banner_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_university ON public.university_rooms(university_id);
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON public.university_rooms(slug);

-- ============================================
-- 6. ROOM ANNOUNCEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.room_announcements (
    id          BIGSERIAL PRIMARY KEY,
    room_id     INTEGER REFERENCES public.university_rooms(id) ON DELETE CASCADE,
    author_id   BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    pinned      BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_room ON public.room_announcements(room_id);

-- ============================================
-- 7. CURRICULUM LEVELS & SHEETS
-- ============================================
CREATE TABLE IF NOT EXISTS public.curriculum_levels (
    id              TEXT PRIMARY KEY,
    slug            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    duration_weeks  INTEGER DEFAULT 6,
    level_number    INTEGER NOT NULL,
    total_problems  INTEGER DEFAULT 0,
    image_url       TEXT,
    order_index     INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.curriculum_sheets (
    id              TEXT PRIMARY KEY,
    level_id        TEXT REFERENCES public.curriculum_levels(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    contest_id      TEXT NOT NULL,
    group_id        TEXT NOT NULL,
    problem_count   INTEGER DEFAULT 26,
    order_index     INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheets_level ON public.curriculum_sheets(level_id);

-- ============================================
-- 8. PROBLEM TEST CASES (both platforms)
-- ============================================
CREATE TABLE IF NOT EXISTS public.problem_test_cases (
    id              SERIAL PRIMARY KEY,
    sheet_id        TEXT NOT NULL,
    problem_id      TEXT NOT NULL,
    input           TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample       BOOLEAN DEFAULT false,
    is_hidden       BOOLEAN DEFAULT false,
    ordinal         INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT now()
);

-- ============================================
-- 9. TRAINING SUBMISSIONS (both platforms)
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_submissions (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sheet_id                TEXT NOT NULL,
    problem_id              TEXT NOT NULL,
    source_code             TEXT NOT NULL,
    language                TEXT DEFAULT 'C++20 (GCC 13-64)',
    verdict                 TEXT NOT NULL,
    status                  TEXT,
    time_ms                 INTEGER,
    memory_kb               INTEGER,
    test_cases_passed       INTEGER DEFAULT 0,
    total_test_cases        INTEGER DEFAULT 0,
    compile_error           TEXT,
    runtime_error           TEXT,
    submitted_at            TIMESTAMPTZ DEFAULT NOW(),
    ip_address              TEXT,
    tab_switches            INTEGER DEFAULT 0,
    paste_events            INTEGER DEFAULT 0,
    time_to_solve_seconds   INTEGER,
    attempt_number          INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_training_subs_user ON public.training_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_subs_sheet ON public.training_submissions(sheet_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_training_subs_verdict ON public.training_submissions(verdict) WHERE verdict = 'Accepted';
CREATE INDEX IF NOT EXISTS idx_training_subs_date ON public.training_submissions(submitted_at);

-- ============================================
-- 10. ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id          TEXT PRIMARY KEY,
    name        TEXT,
    title       TEXT NOT NULL,
    description TEXT,
    icon        TEXT,
    category    TEXT CHECK (category IN ('personal', 'university', 'national')),
    threshold   INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    id              SERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id  TEXT NOT NULL,
    earned_at       TIMESTAMPTZ DEFAULT NOW(),
    seen            BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- ============================================
-- 11. LEADERBOARD CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    user_id         BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    university_id   INTEGER REFERENCES public.universities(id),
    solved_count    INTEGER DEFAULT 0,
    national_rank   INTEGER,
    university_rank INTEGER,
    last_solve_at   TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_university ON public.leaderboard_cache(university_id, university_rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_national ON public.leaderboard_cache(national_rank);

-- ============================================
-- 12. USER STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id             BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    last_activity_date  DATE,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT,
    data        JSONB,
    read        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- ============================================
-- 14. LOGIN LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.login_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT REFERENCES public.users(id),
    ip_address      TEXT,
    user_agent      TEXT,
    logged_in_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. MIRROR PROBLEMS (Verdict CF mirror)
-- ============================================
CREATE TABLE IF NOT EXISTS public.mirror_problems (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contest_id      TEXT NOT NULL,
    problem_index   TEXT NOT NULL,
    data            JSONB NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mirror_views (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contest_id      TEXT NOT NULL,
    problem_index   TEXT NOT NULL,
    user_id         BIGINT REFERENCES public.users(id),
    viewed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. PASSWORD RESETS
-- ============================================
CREATE TABLE IF NOT EXISTS public.password_resets (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR NOT NULL,
    token_hash  TEXT NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    used        BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 17. NEWS REACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.news_reactions (
    id              SERIAL PRIMARY KEY,
    news_id         VARCHAR NOT NULL,
    user_id         INTEGER NOT NULL REFERENCES public.users(id),
    reaction_type   VARCHAR NOT NULL CHECK (reaction_type IN ('like', 'heart', 'fire')),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 18. PAGE VIEWS & VIEW LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.page_views (
    entity_type VARCHAR NOT NULL,
    entity_id   VARCHAR NOT NULL,
    views_count BIGINT DEFAULT 0,
    PRIMARY KEY (entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.view_logs (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    entity_type VARCHAR NOT NULL,
    entity_id   VARCHAR NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 19. WEBSITE ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS public.website_analytics (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    path        TEXT NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    referer     TEXT,
    session_id  TEXT,
    country     TEXT,
    device_type TEXT,
    browser     TEXT,
    os          TEXT,
    visited_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 20. API ACCESS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_access_log (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    endpoint    TEXT NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    method      TEXT,
    status_code INTEGER,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- 21. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-increment university member count
CREATE OR REPLACE FUNCTION increment_university_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.university_id IS NOT NULL AND (OLD IS NULL OR OLD.university_id IS DISTINCT FROM NEW.university_id) THEN
        UPDATE universities SET member_count = member_count + 1 WHERE id = NEW.university_id;
        IF OLD IS NOT NULL AND OLD.university_id IS NOT NULL THEN
            UPDATE universities SET member_count = member_count - 1 WHERE id = OLD.university_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_university_member_count ON public.users;
CREATE TRIGGER tr_update_university_member_count
    AFTER INSERT OR UPDATE OF university_id ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION increment_university_member_count();

-- Auto-create room when first user joins a university
CREATE OR REPLACE FUNCTION auto_create_university_room()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.university_id IS NOT NULL THEN
        INSERT INTO university_rooms (university_id, slug)
        SELECT NEW.university_id, u.slug
        FROM universities u
        WHERE u.id = NEW.university_id
        ON CONFLICT (university_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auto_create_room ON public.users;
CREATE TRIGGER tr_auto_create_room
    AFTER INSERT ON public.users
    FOR EACH ROW
    WHEN (NEW.university_id IS NOT NULL)
    EXECUTE FUNCTION auto_create_university_room();

-- Auto-update leaderboard cache on accepted submission
CREATE OR REPLACE FUNCTION update_leaderboard_on_solve()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verdict = 'Accepted' OR NEW.status = 'AC' THEN
        INSERT INTO leaderboard_cache (user_id, university_id, solved_count, last_solve_at, updated_at)
        SELECT
            NEW.user_id,
            u.university_id,
            (SELECT COUNT(DISTINCT (sheet_id, problem_id))
             FROM training_submissions
             WHERE user_id = NEW.user_id AND (verdict = 'Accepted' OR status = 'AC')),
            NOW(),
            NOW()
        FROM users u WHERE u.id = NEW.user_id
        ON CONFLICT (user_id) DO UPDATE SET
            solved_count = EXCLUDED.solved_count,
            last_solve_at = NOW(),
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_leaderboard ON public.training_submissions;
CREATE TRIGGER tr_update_leaderboard
    AFTER INSERT ON public.training_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_on_solve();

-- Refresh university-level and national ranks (call periodically or after batch updates)
CREATE OR REPLACE FUNCTION refresh_leaderboard_ranks()
RETURNS void AS $$
BEGIN
    -- National ranks
    WITH ranked AS (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY solved_count DESC, last_solve_at ASC) as rn
        FROM leaderboard_cache
    )
    UPDATE leaderboard_cache lc SET national_rank = r.rn
    FROM ranked r WHERE lc.user_id = r.user_id;

    -- University ranks
    WITH uni_ranked AS (
        SELECT user_id, university_id,
               ROW_NUMBER() OVER (PARTITION BY university_id ORDER BY solved_count DESC, last_solve_at ASC) as rn
        FROM leaderboard_cache
        WHERE university_id IS NOT NULL
    )
    UPDATE leaderboard_cache lc SET university_rank = ur.rn
    FROM uni_ranked ur WHERE lc.user_id = ur.user_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 22. USER ACTIVITY TRACKING (cheat detection)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_activity (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES public.users(id),
    session_id  TEXT DEFAULT '',
    action      VARCHAR(50) NOT NULL,
    contest_id  VARCHAR,
    problem_id  VARCHAR,
    sheet_id    VARCHAR,
    metadata    JSONB DEFAULT '{}',
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_action ON public.user_activity(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_contest_problem ON public.user_activity(contest_id, problem_id) WHERE contest_id IS NOT NULL;
