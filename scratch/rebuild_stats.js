const { Client } = require('pg');
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function rebuild() {
    const client = new Client({ connectionString: NEW_DB_URL });
    await client.connect();

    console.log('Rebuilding leaderboard_cache from user_progress...');
    
    // Clear existing cache
    await client.query(`
        WITH UserStats AS (
            SELECT 
                user_id,
                COUNT(*) as total_sub,
                SUM(CASE WHEN verdict = 'Accepted' THEN 1 ELSE 0 END) as acc_sub
            FROM training_submissions
            GROUP BY user_id
        )
        INSERT INTO leaderboard_cache (user_id, university_id, solved_count, accepted_count, total_submissions, last_solve_at, updated_at)
        SELECT
            u.id,
            u.university_id,
            COUNT(DISTINCT up.problem_id),
            COALESCE(us.acc_sub, 0),
            COALESCE(us.total_sub, 0),
            MAX(up.solved_at),
            NOW()
        FROM users u
        LEFT JOIN user_progress up ON up.user_id = u.id AND up.status = 'SOLVED'
        LEFT JOIN UserStats us ON us.user_id = u.id
        GROUP BY u.id, u.university_id, us.acc_sub, us.total_sub
        ON CONFLICT (user_id) DO UPDATE SET
            solved_count = EXCLUDED.solved_count,
            accepted_count = EXCLUDED.accepted_count,
            total_submissions = EXCLUDED.total_submissions,
            last_solve_at = EXCLUDED.last_solve_at,
            updated_at = NOW()
    `);

    console.log('Leaderboard cache rebuilt.');
    
    console.log('Syncing university stats...');
    await client.query(`
        UPDATE universities u
        SET member_count = (
            SELECT COUNT(*) FROM users us WHERE us.university_id = u.id
        ),
        total_solves = (
            SELECT COALESCE(SUM(lc.solved_count), 0)
            FROM users us
            JOIN leaderboard_cache lc ON lc.user_id = us.id
            WHERE us.university_id = u.id
        )
    `);
    console.log('University stats synced.');

    await client.end();
}

rebuild().catch(console.error);
