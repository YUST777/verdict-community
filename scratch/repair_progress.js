const { Client } = require('pg');
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function repair() {
    const client = new Client({ connectionString: NEW_DB_URL });
    await client.connect();

    console.log('Repairing user_progress from training_submissions...');
    
    await client.query(`
        INSERT INTO user_progress (user_id, sheet_id, problem_id, status, solved_at)
        SELECT 
            user_id, 
            sheet_id, 
            REPLACE(problem_id, '-', ':'), 
            'SOLVED', 
            MIN(submitted_at)
        FROM training_submissions
        WHERE verdict IN ('AC', 'Accepted') AND problem_id != '0'
        GROUP BY user_id, sheet_id, problem_id
        ON CONFLICT (user_id, problem_id) DO UPDATE SET
            status = 'SOLVED',
            sheet_id = EXCLUDED.sheet_id,
            solved_at = LEAST(user_progress.solved_at, EXCLUDED.solved_at)
    `);

    console.log('user_progress repaired.');
    await client.end();
}

repair().catch(console.error);
