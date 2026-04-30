-- Migration: Seed Egyptian Universities
-- Date: 2026-04-02
-- Description: Seeds 64 Egyptian universities with their email domains

-- ============================================
-- PUBLIC UNIVERSITIES (27)
-- ============================================
INSERT INTO universities (name, slug, email_domain, short_name, type, is_premium) VALUES
-- Major public universities
('Cairo University', 'cairo', 'cu.edu.eg', 'CU', 'public', true),
('Ain Shams University', 'ainshams', 'asu.edu.eg', 'ASU', 'public', true),
('Alexandria University', 'alexandria', 'alexu.edu.eg', 'AU', 'public', true),
('Mansoura University', 'mansoura', 'mans.edu.eg', 'MU', 'public', false),
('Assiut University', 'assiut', 'aun.edu.eg', 'AUN', 'public', false),
('Tanta University', 'tanta', 'tanta.edu.eg', 'TU', 'public', false),
('Zagazig University', 'zagazig', 'zu.edu.eg', 'ZU', 'public', false),
('Helwan University', 'helwan', 'helwan.edu.eg', 'HU', 'public', false),
('Suez Canal University', 'suezcanal', 'suez.edu.eg', 'SCU', 'public', false),
('Benha University', 'benha', 'bu.edu.eg', 'BU', 'public', false),
('Fayoum University', 'fayoum', 'fayoum.edu.eg', 'FU', 'public', false),
('Beni-Suef University', 'benisuef', 'bsu.edu.eg', 'BSU', 'public', false),
('Minia University', 'minia', 'minia.edu.eg', 'MnU', 'public', false),
('Sohag University', 'sohag', 'sohag.edu.eg', 'SU', 'public', false),
('South Valley University', 'southvalley', 'svu.edu.eg', 'SVU', 'public', false),
('Aswan University', 'aswan', 'aswu.edu.eg', 'ASWU', 'public', false),
('Kafr El-Sheikh University', 'kafrelsheikh', 'kfs.edu.eg', 'KFS', 'public', false),
('Damietta University', 'damietta', 'du.edu.eg', 'DU', 'public', false),
('Port Said University', 'portsaid', 'psu.edu.eg', 'PSU', 'public', false),
('Suez University', 'suez', 'suezuniv.edu.eg', 'SUZ', 'public', false),
('Damanhour University', 'damanhour', 'damanhour.edu.eg', 'DMU', 'public', false),
('Menoufia University', 'menoufia', 'menofia.edu.eg', 'MEU', 'public', false),
('Al-Azhar University', 'alazhar', 'azhar.edu.eg', 'AZU', 'public', false),
('Luxor University', 'luxor', 'luxor.edu.eg', 'LU', 'public', false),
('New Valley University', 'newvalley', 'nvu.edu.eg', 'NVU', 'public', false),
('Matrouh University', 'matrouh', 'mau.edu.eg', 'MAU', 'public', false),
('Arish University', 'arish', 'aru.edu.eg', 'ARU', 'public', false)
ON CONFLICT (email_domain) DO NOTHING;

-- ============================================
-- PRIVATE UNIVERSITIES (24)
-- ============================================
INSERT INTO universities (name, slug, email_domain, short_name, type, is_premium) VALUES
-- Major private universities
('American University in Cairo', 'auc', 'aucegypt.edu', 'AUC', 'private', true),
('German University in Cairo', 'guc', 'guc.edu.eg', 'GUC', 'private', true),
('British University in Egypt', 'bue', 'bue.edu.eg', 'BUE', 'private', false),
('Misr International University', 'miu', 'miuegypt.edu.eg', 'MIU', 'private', false),
('Future University in Egypt', 'fue', 'fue.edu.eg', 'FUE', 'private', false),
('October 6 University', 'o6u', 'o6u.edu.eg', 'O6U', 'private', false),
('Misr University for Science and Technology', 'must', 'must.edu.eg', 'MUST', 'private', false),
('Ahram Canadian University', 'acu', 'acu.edu.eg', 'ACU', 'private', false),
('Modern Sciences and Arts University', 'msa', 'msa.edu.eg', 'MSA', 'private', false),
('Pharos University in Alexandria', 'pua', 'pua.edu.eg', 'PUA', 'private', false),
('Egyptian Russian University', 'eru', 'eru.edu.eg', 'ERU', 'private', false),
('Nile University', 'nu', 'nu.edu.eg', 'NU', 'private', false),
('Zewail City of Science and Technology', 'zewail', 'zewailcity.edu.eg', 'ZC', 'private', false),
('Sinai University', 'sinai', 'su.edu.eg', 'SiU', 'private', false),
('Delta University for Science and Technology', 'delta', 'deltauniv.edu.eg', 'DUS', 'private', false),
('Nahda University', 'nahda', 'nahdauniversity.edu.eg', 'NHU', 'private', false),
('Deraya University', 'deraya', 'deraya.edu.eg', 'DRU', 'private', false),
('Egyptian Chinese University', 'ecu', 'ecu.edu.eg', 'ECU', 'private', false),
('King Salman International University', 'ksiu', 'ksiu.edu.eg', 'KSIU', 'private', false),
('Galala University', 'galala', 'gu.edu.eg', 'GU', 'private', false),
('New Giza University', 'ngu', 'ngu.edu.eg', 'NGU', 'private', false),
('Alamein International University', 'aiu', 'aiu.edu.eg', 'AIU', 'private', false),
('El Shorouk Academy', 'sha', 'sha.edu.eg', 'SHA', 'private', false),
('Canadian International College', 'cic', 'cic-cairo.edu.eg', 'CIC', 'private', false)
ON CONFLICT (email_domain) DO NOTHING;

-- ============================================
-- CIVIL/TECHNICAL INSTITUTES (10)
-- ============================================
INSERT INTO universities (name, slug, email_domain, short_name, type) VALUES
('Arab Academy for Science and Technology', 'aast', 'aast.edu', 'AAST', 'civil'),
('Higher Technological Institute', 'hti', 'hti.edu.eg', 'HTI', 'civil'),
('Institute of Aviation Engineering and Technology', 'iaet', 'iaet.edu.eg', 'IAET', 'civil'),
('Higher Institute of Engineering', 'hie', 'hie.edu.eg', 'HIE', 'civil'),
('Sadat Academy for Management Sciences', 'sams', 'sams.edu.eg', 'SAMS', 'civil'),
('Egyptian E-Learning University', 'eelu', 'eelu.edu.eg', 'EELU', 'civil'),
('Workers University', 'wu', 'wu.edu.eg', 'WU', 'civil'),
('International Academy for Engineering and Media Science', 'iaems', 'iaems.edu.eg', 'IAEMS', 'civil'),
('Higher Institute of Computer Science', 'hics', 'hics.edu.eg', 'HICS', 'civil'),
('Canadian International College Alexandria', 'cica', 'cic-alexandria.edu.eg', 'CICA', 'civil')
ON CONFLICT (email_domain) DO NOTHING;

-- ============================================
-- SPECIAL UNIVERSITIES (3)
-- ============================================
INSERT INTO universities (name, slug, email_domain, short_name, type, is_premium) VALUES
('Horus University', 'horus', 'horus.edu.eg', 'HUE', 'special', true),
('Egypt-Japan University of Science and Technology', 'ejust', 'ejust.edu.eg', 'E-JUST', 'special', false),
('University of Science and Technology at Zewail City', 'ustc', 'zewailcity.edu.eg', 'USTC', 'special', false)
ON CONFLICT (email_domain) DO NOTHING;

-- ============================================
-- SEED CURRICULUM LEVELS
-- ============================================
INSERT INTO curriculum_levels (id, slug, name, title, description, duration_weeks, level_number, total_problems, image_url, order_index) VALUES
('level0', 'level-0', 'Level 0', 'Newcomers Training', 'Start here if you''re new to programming. Learn C++ basics, problem solving fundamentals, and build your foundation.', 6, 0, 249, '/images/lessons/levels/0.webp', 0),
('level1', 'level-1', 'Level 1', 'Assiut Sheets', 'Intermediate level training with classic competitive programming problems from ICPC Assiut community.', 8, 1, 200, '/images/lessons/levels/1.webp', 1),
('level2', 'level-2', 'Level 2', 'Advanced Training', 'Advanced algorithms and data structures. Prepare for regional and international competitions.', 10, 2, 150, '/images/lessons/levels/2.webp', 2)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED CURRICULUM SHEETS (Level 0)
-- ============================================
INSERT INTO curriculum_sheets (id, level_id, name, title, description, contest_id, group_id, problem_count, order_index) VALUES
('sheet-a', 'level0', 'Sheet A', 'Data Types & Conditions', 'Learn how to store data in variables, work with different data types, and make decisions using if-else statements.', '219158', 'MWSDmqGsZm', 26, 0),
('sheet-b', 'level0', 'Sheet B', 'Loops', 'Master the art of repetition! Learn how to execute code multiple times using different loop structures.', '219432', 'MWSDmqGsZm', 26, 1),
('sheet-c', 'level0', 'Sheet C', 'Arrays', 'Store and manipulate collections of data efficiently using arrays.', '219774', 'MWSDmqGsZm', 26, 2),
('sheet-d', 'level0', 'Sheet D', 'Strings', 'Work with text data - one of the most common data types in programming.', '219856', 'MWSDmqGsZm', 26, 3),
('sheet-e', 'level0', 'Sheet E', 'Functions', 'Write reusable, organized, and modular code using functions.', '223205', 'MWSDmqGsZm', 15, 4),
('sheet-f', 'level0', 'Sheet F', 'Math & Geometry', 'Essential mathematics and geometry for competitive programming.', '223338', 'MWSDmqGsZm', 26, 5),
('sheet-g', 'level0', 'Sheet G', 'Recursion', 'Solve complex problems by breaking them into smaller subproblems.', '223839', 'MWSDmqGsZm', 26, 6),
('sheet-h', 'level0', 'Sheet H', 'Frequency Array', 'Count occurrences and track frequencies efficiently.', '224266', 'MWSDmqGsZm', 26, 7),
('sheet-i', 'level0', 'Sheet I', 'Cumulative Sum', 'Prefix sums and range queries - essential for optimization.', '224553', 'MWSDmqGsZm', 26, 8),
('sheet-j', 'level0', 'Sheet J', '2D Arrays', 'Work with matrices and two-dimensional data structures.', '224696', 'MWSDmqGsZm', 26, 9)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (id, title, description, icon, category, threshold) VALUES
-- Personal achievements
('first_solve', 'First Blood', 'Solved your first problem on the platform', 'trophy', 'personal', 1),
('solve_10', 'Getting Started', 'Solved 10 problems', 'star', 'personal', 10),
('solve_25', 'Problem Crusher', 'Solved 25 problems', 'fire', 'personal', 25),
('solve_50', 'Half Century', 'Solved 50 problems', 'medal', 'personal', 50),
('solve_100', 'Century Club', 'Solved 100 problems', 'crown', 'personal', 100),
('solve_200', 'Elite Solver', 'Solved 200 problems', 'diamond', 'personal', 200),
('streak_3', 'Consistent', 'Maintained a 3-day solving streak', 'flame', 'personal', 3),
('streak_7', 'Weekly Warrior', 'Maintained a 7-day solving streak', 'calendar', 'personal', 7),
('streak_14', 'Two Weeks Strong', 'Maintained a 14-day solving streak', 'rocket', 'personal', 14),
('streak_30', 'Monthly Master', 'Maintained a 30-day solving streak', 'lightning', 'personal', 30),
('sheet_complete', 'Sheet Slayer', 'Completed an entire training sheet', 'checkmark', 'personal', 1),
('level_complete', 'Level Up', 'Completed an entire curriculum level', 'upgrade', 'personal', 1),
-- University achievements
('uni_top_10', 'University Star', 'Ranked in top 10 at your university', 'star', 'university', 10),
('uni_top_3', 'University Elite', 'Ranked in top 3 at your university', 'podium', 'university', 3),
('uni_rank_1', 'University Champion', 'Ranked #1 at your university', 'crown', 'university', 1),
('founding_member', 'Founding Member', 'One of the first members from your university', 'badge', 'university', NULL),
-- National achievements
('national_top_100', 'National Talent', 'Ranked in national top 100', 'flag', 'national', 100),
('national_top_50', 'Rising Star', 'Ranked in national top 50', 'star', 'national', 50),
('national_top_10', 'National Elite', 'Ranked in national top 10', 'trophy', 'national', 10),
('national_rank_1', 'Egypt''s Best', 'Ranked #1 nationally', 'crown', 'national', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE COUNTS
-- ============================================
UPDATE curriculum_levels SET total_problems = (
    SELECT COALESCE(SUM(problem_count), 0) FROM curriculum_sheets WHERE level_id = curriculum_levels.id
);
