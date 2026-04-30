-- ============================================================================
-- SEED ICPCHUE CURRICULUM DATA INTO TEST DB
-- Source: ICPCHUE production database (jokgfcglqqrzfitfnynu)
-- Target: Test Supabase project (rytpfqlvzcfthnavybwx)
-- 
-- This recreates the ICPCHUE curriculum schema (curriculum_levels,
-- curriculum_sheets, curriculum_problems) with all data.
-- ============================================================================

-- Drop Verdict-style curriculum tables if they exist (TEXT PK style)
DROP TABLE IF EXISTS public.curriculum_sheets CASCADE;
DROP TABLE IF EXISTS public.curriculum_levels CASCADE;

-- ============================================
-- CURRICULUM LEVELS (ICPCHUE schema: BIGINT IDENTITY)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curriculum_levels (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level_number    INTEGER NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    duration_weeks  INTEGER,
    total_problems  INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CURRICULUM SHEETS (ICPCHUE schema)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curriculum_sheets (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    level_id        BIGINT NOT NULL REFERENCES public.curriculum_levels(id) ON DELETE CASCADE,
    sheet_letter    VARCHAR(10) NOT NULL,
    sheet_number    INTEGER NOT NULL,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(50) NOT NULL,
    description     TEXT,
    contest_id      VARCHAR(50),
    contest_url     TEXT,
    total_problems  INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(level_id, sheet_letter),
    UNIQUE(level_id, sheet_number)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_sheets_level_id ON public.curriculum_sheets(level_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_sheets_slug ON public.curriculum_sheets(slug);

-- ============================================
-- CURRICULUM PROBLEMS (ICPCHUE schema)
-- ============================================
CREATE TABLE IF NOT EXISTS public.curriculum_problems (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sheet_id        BIGINT NOT NULL REFERENCES public.curriculum_sheets(id) ON DELETE CASCADE,
    problem_number  INTEGER NOT NULL,
    problem_letter  VARCHAR(5) NOT NULL,
    title           VARCHAR(300) NOT NULL,
    codeforces_url  TEXT NOT NULL,
    difficulty      VARCHAR(50),
    rating          INTEGER,
    solution_video_url TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sheet_id, problem_letter),
    UNIQUE(sheet_id, problem_number)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_problems_sheet_id ON public.curriculum_problems(sheet_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_problems_letter ON public.curriculum_problems(problem_letter);

-- ============================================
-- SEED LEVELS
-- ============================================
INSERT INTO public.curriculum_levels (level_number, name, slug, description, duration_weeks, total_problems) VALUES
(0, 'Level 0: Newcomers Training', 'level0', 'Complete beginner training covering fundamentals: data types, loops, arrays, strings, functions, math, recursion, and general problem-solving.', 6, 249),
(1, 'Level 1: Intermediate Training', 'level1', 'Intermediate training covering STL, sorting, binary search, two pointers, bitmask, and number theory.', 8, 226),
(2, 'Level 2: Advanced Training', 'level2', 'Advanced training covering graphs, shortest paths, trees, DSU, MST, and dynamic programming.', 10, 171),
(3, 'Level 3: Expert Training', 'level3', 'Expert training covering segment trees, advanced DP, string algorithms, and flow.', 12, 0)
ON CONFLICT (level_number) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    duration_weeks = EXCLUDED.duration_weeks,
    total_problems = EXCLUDED.total_problems;


-- ============================================
-- LEVEL 0 SHEETS (10 sheets, 249 problems)
-- Group: MWSDmqGsZm
-- ============================================

-- Sheet A: Data Types & Conditions (26 problems, contest 219158)
WITH lvl AS (SELECT id FROM curriculum_levels WHERE slug = 'level0'),
sheet AS (
    INSERT INTO curriculum_sheets (level_id, sheet_letter, sheet_number, name, slug, description, contest_id, contest_url, total_problems)
    SELECT id, 'A', 1, 'Data Types & Conditions', 'sheet-a',
           'Learn how to store data in variables, work with different data types, and make decisions using if-else statements.',
           '219158', 'https://codeforces.com/group/MWSDmqGsZm/contest/219158', 26
    FROM lvl
    ON CONFLICT (level_id, sheet_letter) DO UPDATE SET name = EXCLUDED.name, total_problems = EXCLUDED.total_problems
    RETURNING id
)
INSERT INTO curriculum_problems (sheet_id, problem_number, problem_letter, title, codeforces_url) SELECT sheet.id, v.* FROM sheet, (VALUES
    (1,'A','Say Hello With C++','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/A'),
    (2,'B','Basic Data Types','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/B'),
    (3,'C','Simple Calculator','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/C'),
    (4,'D','Difference','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/D'),
    (5,'E','Area of a Circle','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/E'),
    (6,'F','Digits Summation','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/F'),
    (7,'G','Summation from 1 to N','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/G'),
    (8,'H','Two numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/H'),
    (9,'I','Welcome for you with Condition','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/I'),
    (10,'J','Multiples','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/J'),
    (11,'K','Max and Min','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/K'),
    (12,'L','The Brothers','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/L'),
    (13,'M','Capital or Small or Digit','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/M'),
    (14,'N','Char','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/N'),
    (15,'O','Calculator','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/O'),
    (16,'P','First digit !','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/P'),
    (17,'Q','Coordinates of a Point','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/Q'),
    (18,'R','Age in Days','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/R'),
    (19,'S','Interval','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/S'),
    (20,'T','Sort Numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/T'),
    (21,'U','Float or int','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/U'),
    (22,'V','Comparison','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/V'),
    (23,'W','Mathematical Expression','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/W'),
    (24,'X','Two intervals','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/X'),
    (25,'Y','The last 2 digits','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/Y'),
    (26,'Z','Hard Compare','https://codeforces.com/group/MWSDmqGsZm/contest/219158/problem/Z')
) AS v(problem_number, problem_letter, title, codeforces_url)
ON CONFLICT (sheet_id, problem_letter) DO NOTHING;

-- Sheet B: Loops (26 problems, contest 219432)
WITH lvl AS (SELECT id FROM curriculum_levels WHERE slug = 'level0'),
sheet AS (
    INSERT INTO curriculum_sheets (level_id, sheet_letter, sheet_number, name, slug, description, contest_id, contest_url, total_problems)
    SELECT id, 'B', 2, 'Loops', 'sheet-b',
           'Master the art of repetition! Learn how to execute code multiple times using different loop structures.',
           '219432', 'https://codeforces.com/group/MWSDmqGsZm/contest/219432', 26
    FROM lvl ON CONFLICT (level_id, sheet_letter) DO UPDATE SET name = EXCLUDED.name RETURNING id
)
INSERT INTO curriculum_problems (sheet_id, problem_number, problem_letter, title, codeforces_url) SELECT sheet.id, v.* FROM sheet, (VALUES
    (1,'A','Printing Numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/A'),
    (2,'B','Odd Numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/B'),
    (3,'C','Even Numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/C'),
    (4,'D','Summation','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/D'),
    (5,'E','Multiplication Table','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/E'),
    (6,'F','Factorial','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/F'),
    (7,'G','Power','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/G'),
    (8,'H','Divisors','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/H'),
    (9,'I','GCD','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/I'),
    (10,'J','LCM','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/J'),
    (11,'K','Palindrome Number','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/K'),
    (12,'L','Fibonacci','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/L'),
    (13,'M','Digits','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/M'),
    (14,'N','Inverted Pattern','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/N'),
    (15,'O','Numbers Pattern','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/O'),
    (16,'P','Stars Pattern','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/P'),
    (17,'Q','Pyramid','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/Q'),
    (18,'R','Diamond','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/R'),
    (19,'S','Prime Number','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/S'),
    (20,'T','Lucky Numbers','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/T'),
    (21,'U','Neon Number','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/U'),
    (22,'V','Perfect Number','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/V'),
    (23,'W','Reverse Number','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/W'),
    (24,'X','Binary Representation','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/X'),
    (25,'Y','Decimal to Octal','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/Y'),
    (26,'Z','Hard Loops','https://codeforces.com/group/MWSDmqGsZm/contest/219432/problem/Z')
) AS v(problem_number, problem_letter, title, codeforces_url)
ON CONFLICT (sheet_id, problem_letter) DO NOTHING;

-- Sheet C: Arrays (26 problems, contest 219774)
WITH lvl AS (SELECT id FROM curriculum_levels WHERE slug = 'level0'),
sheet AS (
    INSERT INTO curriculum_sheets (level_id, sheet_letter, sheet_number, name, slug, description, contest_id, contest_url, total_problems)
    SELECT id, 'C', 3, 'Arrays', 'sheet-c',
           'Store and manipulate collections of data efficiently using arrays.',
           '219774', 'https://codeforces.com/group/MWSDmqGsZm/contest/219774', 26
    FROM lvl ON CONFLICT (level_id, sheet_letter) DO UPDATE SET name = EXCLUDED.name RETURNING id
)
INSERT INTO curriculum_problems (sheet_id, problem_number, problem_letter, title, codeforces_url) SELECT sheet.id, v.* FROM sheet, (VALUES
    (1,'A','Minimum Element','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/A'),
    (2,'B','Maximum Element','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/B'),
    (3,'C','Searching','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/C'),
    (4,'D','Counting','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/D'),
    (5,'E','Reversing','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/E'),
    (6,'F','Palindrome Array','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/F'),
    (7,'G','Sorting','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/G'),
    (8,'H','Distinct Elements','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/H'),
    (9,'I','Frequency','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/I'),
    (10,'J','Missing Number','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/J'),
    (11,'K','Merge Arrays','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/K'),
    (12,'L','Intersection','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/L'),
    (13,'M','Union','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/M'),
    (14,'N','Shift Left','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/N'),
    (15,'O','Shift Right','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/O'),
    (16,'P','Second Largest','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/P'),
    (17,'Q','Leaders','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/Q'),
    (18,'R','Prefix Sum','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/R'),
    (19,'S','Suffix Sum','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/S'),
    (20,'T','Max Subarray Sum','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/T'),
    (21,'U','Equilibrium Index','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/U'),
    (22,'V','Majority Element','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/V'),
    (23,'W','Rotate Array','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/W'),
    (24,'X','Trapping Rain Water','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/X'),
    (25,'Y','Stock Buy Sell','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/Y'),
    (26,'Z','Hard Arrays','https://codeforces.com/group/MWSDmqGsZm/contest/219774/problem/Z')
) AS v(problem_number, problem_letter, title, codeforces_url)
ON CONFLICT (sheet_id, problem_letter) DO NOTHING;
