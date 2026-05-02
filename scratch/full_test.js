process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { query } = require('../src/lib/db');
const { icpchueQuery } = require('../src/lib/icpchue_db');
const { curriculum } = require('../src/lib/curriculum');

async function test(userId) {
    const userResult = await query('SELECT email, university_id, original_id FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    console.log('User:', user);

    const progress = {};
    for (const level of curriculum) {
        progress[level.slug] = { solved: 0, total: level.totalProblems };
    }

    const solvedProblems = new Set();
    const verdictResult = await query(`
        SELECT sheet_id, problem_id
        FROM public.user_progress
        WHERE user_id = $1 AND status = 'SOLVED'
    `, [userId]);

    console.log(`Verdict DB found ${verdictResult.rows.length} solved problems.`);
    for (const row of verdictResult.rows) {
        solvedProblems.add(`verdict:${row.sheet_id}:${row.problem_id}`);
    }

    if (Number(user.university_id) === 1 && user.original_id) {
        const hueUserId = user.original_id;
        const hueProgressResult = await icpchueQuery(`
            SELECT sheet_id, problem_id
            FROM public.user_progress
            WHERE user_id = $1 AND status = 'SOLVED'
        `, [hueUserId]);
        console.log(`HUE DB found ${hueProgressResult.rows.length} solved problems.`);
        for (const row of hueProgressResult.rows) {
            solvedProblems.add(`hue:${row.sheet_id}:${row.problem_id}`);
        }
    }

    const uniqueSolvedByLevel = new Set();
    for (const solveKey of solvedProblems) {
        const parts = solveKey.split(':');
        if (parts.length < 3) continue;

        const problemIdRaw = parts.slice(2).join(':');
        const problemParts = problemIdRaw.split(/[:\-]/);
        const contestId = problemParts[0];
        const problemLetter = problemParts[1];

        for (const level of curriculum) {
            const sheet = level.sheets.find(s => s.contestId === contestId);
            if (sheet) {
                uniqueSolvedByLevel.add(`${level.slug}:${contestId}:${problemLetter}`);
                break;
            }
        }
    }

    for (const problemKey of uniqueSolvedByLevel) {
        const levelSlug = problemKey.split(':')[0];
        if (progress[levelSlug]) {
            progress[levelSlug].solved += 1;
        }
    }

    console.log('Final Progress:', progress);
}

test(202).catch(console.error);
