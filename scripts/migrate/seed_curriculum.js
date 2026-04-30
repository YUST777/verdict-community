#!/usr/bin/env node
/**
 * Seed ICPCHUE curriculum into the test database.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate/seed_curriculum.js
 * 
 * This script:
 * 1. Creates curriculum_levels, curriculum_sheets, curriculum_problems tables (ICPCHUE schema)
 * 2. Seeds all 4 levels, 18 sheets, and generates problems for each sheet
 * 3. Safe to run multiple times (uses ON CONFLICT)
 */

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const LETTERS_26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTERS_15 = 'ABCDEFGHIJKLMNO'.split('');

// Full curriculum data from ICPCHUE
const levels = [
    { number: 0, name: 'Level 0: Newcomers Training', slug: 'level0', description: 'Complete beginner training covering fundamentals: data types, loops, arrays, strings, functions, math, recursion, and general problem-solving.', weeks: 6, problems: 249 },
    { number: 1, name: 'Level 1: Intermediate Training', slug: 'level1', description: 'Intermediate training covering STL, sorting, binary search, two pointers, bitmask, and number theory.', weeks: 8, problems: 226 },
    { number: 2, name: 'Level 2: Advanced Training', slug: 'level2', description: 'Advanced training covering graphs, shortest paths, trees, DSU, MST, and dynamic programming.', weeks: 10, problems: 171 },
    { number: 3, name: 'Level 3: Expert Training', slug: 'level3', description: 'Expert training covering segment trees, advanced DP, string algorithms, and flow.', weeks: 12, problems: 0 },
];

const sheets = [
    // Level 0 (group: MWSDmqGsZm)
    { level: 'level0', letter: 'A', num: 1, name: 'Data Types & Conditions', slug: 'sheet-a', desc: 'Learn how to store data in variables, work with different data types, and make decisions using if-else statements.', contestId: '219158', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'B', num: 2, name: 'Loops', slug: 'sheet-b', desc: 'Master the art of repetition! Learn how to execute code multiple times using different loop structures.', contestId: '219432', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'C', num: 3, name: 'Arrays', slug: 'sheet-c', desc: 'Store and manipulate collections of data efficiently using arrays.', contestId: '219774', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'D', num: 4, name: 'Strings', slug: 'sheet-d', desc: 'Work with text data — one of the most common data types in programming.', contestId: '219856', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'E', num: 5, name: 'Functions', slug: 'sheet-e', desc: 'Write reusable, organized, and modular code using functions.', contestId: '223205', group: 'MWSDmqGsZm', problems: LETTERS_15 },
    { level: 'level0', letter: 'F', num: 6, name: 'Math & Geometry', slug: 'sheet-f', desc: 'Essential mathematics and geometry for competitive programming.', contestId: '223338', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'G', num: 7, name: 'Recursion', slug: 'sheet-g', desc: 'Learn the powerful technique of solving problems by breaking them into smaller subproblems.', contestId: '223339', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'H', num: 8, name: 'General Easy', slug: 'sheet-h', desc: 'Practice with 800-1000 rated Codeforces problems.', contestId: '223206', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'I', num: 9, name: 'General Medium', slug: 'sheet-i', desc: 'Practice with 1000-1200 rated Codeforces problems.', contestId: '223207', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    { level: 'level0', letter: 'J', num: 10, name: 'General Hard', slug: 'sheet-j', desc: 'Practice with 1200-1400 rated Codeforces problems.', contestId: '223340', group: 'MWSDmqGsZm', problems: LETTERS_26 },
    // Level 1 (group: 3nQaj5GMG5)
    { level: 'level1', letter: 'A', num: 1, name: 'Time Complexity & Vectors', slug: 'l1-sheet-a', desc: 'Learn algorithm efficiency, vectors, prefix sum, and frequency arrays.', contestId: '372026', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'B', num: 2, name: 'STL Containers', slug: 'l1-sheet-b', desc: 'Master Pair, Tuple, Vector, Set, Map, and unordered containers.', contestId: '373244', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'C', num: 3, name: 'STL & Sorting', slug: 'l1-sheet-c', desc: 'Stack, Queue, Priority Queue, Deque, and custom comparators.', contestId: '374321', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'D', num: 4, name: 'Binary Search & Two Pointers', slug: 'l1-sheet-d', desc: 'The most important algorithm in competitive programming!', contestId: '376466', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'E', num: 5, name: 'Bitmask', slug: 'l1-sheet-e', desc: 'Unlock the power of bit manipulation!', contestId: '377898', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'F', num: 6, name: 'Number Theory Basics', slug: 'l1-sheet-f', desc: 'Essential mathematics for competitive programming.', contestId: '379012', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'G', num: 7, name: 'Prefix Sum & Frequency Array', slug: 'l1-sheet-g', desc: 'Essential techniques for range queries and counting.', contestId: '380145', group: '3nQaj5GMG5', problems: LETTERS_26 },
    { level: 'level1', letter: 'H', num: 8, name: 'Two Pointers & Sliding Window', slug: 'l1-sheet-h', desc: 'Elegant O(n) solutions for array problems.', contestId: '381278', group: '3nQaj5GMG5', problems: LETTERS_26 },
];

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create tables
        console.log('Creating curriculum tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.curriculum_levels (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                level_number INTEGER NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                duration_weeks INTEGER,
                total_problems INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.curriculum_sheets (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                level_id BIGINT NOT NULL REFERENCES public.curriculum_levels(id) ON DELETE CASCADE,
                sheet_letter VARCHAR(10) NOT NULL,
                sheet_number INTEGER NOT NULL,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(50) NOT NULL,
                description TEXT,
                contest_id VARCHAR(50),
                contest_url TEXT,
                total_problems INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(level_id, sheet_letter),
                UNIQUE(level_id, sheet_number)
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.curriculum_problems (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                sheet_id BIGINT NOT NULL REFERENCES public.curriculum_sheets(id) ON DELETE CASCADE,
                problem_number INTEGER NOT NULL,
                problem_letter VARCHAR(5) NOT NULL,
                title VARCHAR(300) NOT NULL,
                codeforces_url TEXT NOT NULL,
                difficulty VARCHAR(50),
                rating INTEGER,
                solution_video_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(sheet_id, problem_letter),
                UNIQUE(sheet_id, problem_number)
            )
        `);

        // 2. Seed levels
        console.log('Seeding levels...');
        for (const lvl of levels) {
            await client.query(`
                INSERT INTO curriculum_levels (level_number, name, slug, description, duration_weeks, total_problems)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (level_number) DO UPDATE SET
                    name = EXCLUDED.name, description = EXCLUDED.description,
                    duration_weeks = EXCLUDED.duration_weeks, total_problems = EXCLUDED.total_problems
            `, [lvl.number, lvl.name, lvl.slug, lvl.description, lvl.weeks, lvl.problems]);
        }

        // 3. Seed sheets and problems
        let totalProblems = 0;
        for (const sheet of sheets) {
            console.log(`  Seeding ${sheet.level} ${sheet.name} (${sheet.problems.length} problems)...`);

            // Get level ID
            const lvlRes = await client.query('SELECT id FROM curriculum_levels WHERE slug = $1', [sheet.level]);
            if (lvlRes.rows.length === 0) continue;
            const levelId = lvlRes.rows[0].id;

            const contestUrl = `https://codeforces.com/group/${sheet.group}/contest/${sheet.contestId}`;

            // Insert sheet
            const sheetRes = await client.query(`
                INSERT INTO curriculum_sheets (level_id, sheet_letter, sheet_number, name, slug, description, contest_id, contest_url, total_problems)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (level_id, sheet_letter) DO UPDATE SET
                    name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description,
                    contest_id = EXCLUDED.contest_id, contest_url = EXCLUDED.contest_url, total_problems = EXCLUDED.total_problems
                RETURNING id
            `, [levelId, sheet.letter, sheet.num, sheet.name, sheet.slug, sheet.desc, sheet.contestId, contestUrl, sheet.problems.length]);

            const sheetId = sheetRes.rows[0].id;

            // Insert problems
            for (let i = 0; i < sheet.problems.length; i++) {
                const letter = sheet.problems[i];
                const problemUrl = `${contestUrl}/problem/${letter}`;
                const title = `Problem ${letter}`; // Generic title — real titles come from CF scraping

                await client.query(`
                    INSERT INTO curriculum_problems (sheet_id, problem_number, problem_letter, title, codeforces_url)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (sheet_id, problem_letter) DO NOTHING
                `, [sheetId, i + 1, letter, title, problemUrl]);
                totalProblems++;
            }
        }

        await client.query('COMMIT');
        console.log(`\n✓ Done! Seeded ${levels.length} levels, ${sheets.length} sheets, ${totalProblems} problems.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('ERROR:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
