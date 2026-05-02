const { Client } = require('pg');

async function run() {
    const verdictClient = new Client({
        connectionString: 'postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres'
    });
    await verdictClient.connect();

    const handle = 'BusinessDuck1';
    const userId = 308; // 8241043@horus.edu.eg

    console.log(`Syncing progress for ${handle} (User ID: ${userId})...`);

    try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
        const data = await response.json();

        if (data.status !== 'OK') {
            console.error('Codeforces API error:', data.comment);
            return;
        }

        const accepted = data.result.filter(s => s.verdict === 'OK');
        console.log(`Found ${accepted.length} accepted submissions on Codeforces.`);

        // Get all curriculum problems to match
        const problemsRes = await verdictClient.query(`
            SELECT cp.id, cp.contest_id, cp.problem_letter, cs.id as sheet_id, l.level_number
            FROM curriculum_problems cp
            JOIN curriculum_sheets cs ON cp.sheet_id = cs.id
            JOIN curriculum_levels l ON cs.level_id = l.id
        `);
        const problemMap = new Map();
        for (const p of problemsRes.rows) {
            problemMap.set(`${p.contest_id}:${p.problem_letter.toUpperCase()}`, p);
        }

        let syncCount = 0;
        for (const sub of accepted) {
            const key = `${sub.contestId}:${sub.problem.index.toUpperCase()}`;
            const problem = problemMap.get(key);

            if (problem) {
                // Upsert into user_progress
                await verdictClient.query(`
                    INSERT INTO user_progress (user_id, problem_id, sheet_id, status, submission_id, solved_at)
                    VALUES ($1, $2, $3, 'SOLVED', $4, to_timestamp($5))
                    ON CONFLICT (user_id, problem_id) DO NOTHING
                `, [
                    userId,
                    key,
                    problem.sheet_id,
                    sub.id,
                    sub.creationTimeSeconds
                ]);
                syncCount++;
            }
        }

        console.log(`Successfully synced ${syncCount} problems for ${handle}.`);

    } catch (error) {
        console.error('Sync failed:', error);
    } finally {
        await verdictClient.end();
    }
}

run();
