-- Migration: University Hub Schema
-- Date: 2026-04-02
-- Description: Creates tables for Egypt-wide university training hub
--              Supports .edu.eg email validation, university rooms, and scoped leaderboards

-- ============================================
-- UNIVERSITIES TABLE
-- 64 Egyptian universities with email domains
-- ============================================
CREATE TABLE IF NOT EXISTS universities (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL UNIQUE,
    slug            TEXT NOT NULL UNIQUE,
    email_domain    TEXT NOT NULL UNIQUE,
    short_name      TEXT,
    type            TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'civil', 'special')),
    logo_url        TEXT,
    is_premium      BOOLEAN DEFAULT FALSE,
    member_count    INTEGER DEFAULT 0,
    total_solves    INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    verified        BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_universities_domain ON universities(email_domain);
CREATE INDEX idx_universities_slug ON universities(slug);

-- ============================================
-- UNIVERSITY ROOMS (auto-created per university)
-- ============================================
CREATE TABLE IF NOT EXISTS university_rooms (
    id              SERIAL PRIMARY KEY,
    university_id   INTEGER UNIQUE REFERENCES universities(id) ON DELETE CASCADE,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    banner_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_university ON university_rooms(university_id);
CREATE INDEX idx_rooms_slug ON university_rooms(slug);

-- ============================================
-- ROOM ANNOUNCEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS room_announcements (
    id          BIGSERIAL PRIMARY KEY,
    room_id     INTEGER REFERENCES university_rooms(id) ON DELETE CASCADE,
    author_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    body        TEXT NOT NULL,
    pinned      BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_room ON room_announcements(room_id);

-- ============================================
-- APPLICATIONS TABLE (registration data)
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
    id                      BIGSERIAL PRIMARY KEY,
    application_type        TEXT DEFAULT 'trainee',
    name                    TEXT NOT NULL,
    faculty                 TEXT NOT NULL,
    student_id              TEXT NOT NULL,
    student_id_blind_index  TEXT UNIQUE,
    national_id             TEXT,
    national_id_blind_index TEXT,
    student_level           TEXT NOT NULL,
    telephone               TEXT NOT NULL,
    telephone_blind_index   TEXT,
    has_laptop              BOOLEAN DEFAULT FALSE,
    codeforces_profile      TEXT,
    leetcode_profile        TEXT,
    email                   TEXT,
    email_blind_index       TEXT,
    ip_address              TEXT,
    user_agent              TEXT,
    submitted_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_email_blind ON applications(email_blind_index);
CREATE INDEX idx_applications_student_blind ON applications(student_id_blind_index);

-- ============================================
-- EMAIL VERIFICATION OTPs
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_otps (
    email       TEXT NOT NULL PRIMARY KEY,
    otp_code    TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    attempts    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD COLUMNS TO EXISTING USERS TABLE
-- ============================================
DO $$
BEGIN
    -- University linking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'university_id') THEN
        ALTER TABLE users ADD COLUMN university_id INTEGER REFERENCES universities(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'university_slug') THEN
        ALTER TABLE users ADD COLUMN university_slug TEXT;
    END IF;
    
    -- User profile fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'faculty') THEN
        ALTER TABLE users ADD COLUMN faculty TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'student_level') THEN
        ALTER TABLE users ADD COLUMN student_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'student_id_encrypted') THEN
        ALTER TABLE users ADD COLUMN student_id_encrypted TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'application_id') THEN
        ALTER TABLE users ADD COLUMN application_id BIGINT REFERENCES applications(id);
    END IF;
    
    -- Role and permissions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('member', 'ambassador', 'admin', 'owner'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_university_verified') THEN
        ALTER TABLE users ADD COLUMN is_university_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
    END IF;
    
    -- Privacy settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'show_on_leaderboard') THEN
        ALTER TABLE users ADD COLUMN show_on_leaderboard BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'show_public_profile') THEN
        ALTER TABLE users ADD COLUMN show_public_profile BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_shadow_banned') THEN
        ALTER TABLE users ADD COLUMN is_shadow_banned BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Display name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'display_name') THEN
        ALTER TABLE users ADD COLUMN display_name TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_university ON users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- TRAINING SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS training_submissions (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sheet_id                TEXT NOT NULL,
    problem_id              TEXT NOT NULL,
    source_code             TEXT NOT NULL,
    language                TEXT DEFAULT 'C++20 (GCC 13-64)',
    verdict                 TEXT NOT NULL,
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

CREATE INDEX idx_training_subs_user ON training_submissions(user_id);
CREATE INDEX idx_training_subs_sheet ON training_submissions(sheet_id, problem_id);
CREATE INDEX idx_training_subs_verdict ON training_submissions(verdict) WHERE verdict = 'Accepted';
CREATE INDEX idx_training_subs_date ON training_submissions(submitted_at);

-- ============================================
-- ACHIEVEMENTS DEFINITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    icon        TEXT,
    category    TEXT CHECK (category IN ('personal', 'university', 'national')),
    threshold   INTEGER,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER ACHIEVEMENTS (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id              SERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    achievement_id  TEXT REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at       TIMESTAMPTZ DEFAULT NOW(),
    seen            BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- LEADERBOARD CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    user_id         BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    university_id   INTEGER REFERENCES universities(id),
    solved_count    INTEGER DEFAULT 0,
    national_rank   INTEGER,
    university_rank INTEGER,
    last_solve_at   TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_university ON leaderboard_cache(university_id, university_rank);
CREATE INDEX idx_leaderboard_national ON leaderboard_cache(national_rank);

-- ============================================
-- CURRICULUM LEVELS
-- ============================================
CREATE TABLE IF NOT EXISTS curriculum_levels (
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

-- ============================================
-- CURRICULUM SHEETS
-- ============================================
CREATE TABLE IF NOT EXISTS curriculum_sheets (
    id              TEXT PRIMARY KEY,
    level_id        TEXT REFERENCES curriculum_levels(id) ON DELETE CASCADE,
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

CREATE INDEX idx_sheets_level ON curriculum_sheets(level_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT,
    data        JSONB,
    read        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ============================================
-- USER STREAKS
-- ============================================
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id             BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak      INTEGER DEFAULT 0,
    longest_streak      INTEGER DEFAULT 0,
    last_activity_date  DATE,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on new tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Public read policies for universities
CREATE POLICY "Universities are viewable by everyone" ON universities FOR SELECT USING (true);

-- Public read policies for rooms
CREATE POLICY "Rooms are viewable by everyone" ON university_rooms FOR SELECT USING (is_active = true);

-- Announcements viewable by everyone
CREATE POLICY "Announcements are viewable by everyone" ON room_announcements FOR SELECT USING (true);

-- Applications only viewable by owner or admin
CREATE POLICY "Users can view own application" ON applications FOR SELECT USING (
    email_blind_index = (SELECT email_blind_index FROM users WHERE id = auth.uid()::bigint)
);

-- Training submissions viewable by owner
CREATE POLICY "Users can view own submissions" ON training_submissions FOR SELECT USING (user_id = auth.uid()::bigint);
CREATE POLICY "Users can insert own submissions" ON training_submissions FOR INSERT WITH CHECK (user_id = auth.uid()::bigint);

-- Achievements viewable by everyone
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- User achievements viewable by owner
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (user_id = auth.uid()::bigint);

-- Leaderboard cache viewable by everyone
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard_cache FOR SELECT USING (true);

-- Curriculum viewable by everyone
CREATE POLICY "Curriculum levels are viewable by everyone" ON curriculum_levels FOR SELECT USING (is_active = true);
CREATE POLICY "Curriculum sheets are viewable by everyone" ON curriculum_sheets FOR SELECT USING (is_active = true);

-- Notifications only viewable by owner
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::bigint);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()::bigint);

-- Streaks viewable by owner
CREATE POLICY "Users can view own streaks" ON user_streaks FOR SELECT USING (user_id = auth.uid()::bigint);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment university member count
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

-- Trigger for member count
DROP TRIGGER IF EXISTS tr_update_university_member_count ON users;
CREATE TRIGGER tr_update_university_member_count
    AFTER INSERT OR UPDATE OF university_id ON users
    FOR EACH ROW
    EXECUTE FUNCTION increment_university_member_count();

-- Function to auto-create room when first user joins
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

-- Trigger for auto room creation
DROP TRIGGER IF EXISTS tr_auto_create_room ON users;
CREATE TRIGGER tr_auto_create_room
    AFTER INSERT ON users
    FOR EACH ROW
    WHEN (NEW.university_id IS NOT NULL)
    EXECUTE FUNCTION auto_create_university_room();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE universities IS 'Egyptian universities with email domains for auto-detection';
COMMENT ON TABLE university_rooms IS 'University-specific training rooms (auto-created)';
COMMENT ON TABLE room_announcements IS 'Ambassador-posted announcements for university rooms';
COMMENT ON TABLE applications IS 'Student registration applications with encrypted PII';
COMMENT ON TABLE email_verification_otps IS 'OTP codes for email verification (10 min expiry)';
COMMENT ON TABLE training_submissions IS 'Code submissions for training sheet problems';
COMMENT ON TABLE achievements IS 'Achievement definitions (badges/rewards)';
COMMENT ON TABLE user_achievements IS 'User earned achievements';
COMMENT ON TABLE leaderboard_cache IS 'Cached leaderboard rankings (refreshed every 5 min)';
COMMENT ON TABLE curriculum_levels IS 'Training curriculum levels (Level 0, 1, 2)';
COMMENT ON TABLE curriculum_sheets IS 'Training sheets within each level';
COMMENT ON TABLE notifications IS 'User notifications (achievements, announcements)';
COMMENT ON TABLE user_streaks IS 'User activity streaks';
