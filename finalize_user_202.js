const { Client } = require('pg');
const OLD_DB_URL = 'postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
const NEW_DB_URL = 'postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const Cryptr = require('cryptr');
const cryptr = new Cryptr('2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3');

async function run() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL });
    await oldClient.connect();
    await newClient.connect();

    // 1. Fix Name
    const { rows: appRows } = await oldClient.query('SELECT a.name FROM public.users u JOIN public.applications a ON u.application_id = a.id WHERE u.id = 103');
    if (appRows.length > 0 && appRows[0].name) {
        const name = appRows[0].name;
        const encName = cryptr.encrypt(name);
        await newClient.query('UPDATE users SET name = $1, display_name = $1 WHERE id = 202', [encName]);
        console.log('Updated name to:', name);
    }

    // 2. Migrate Submissions
    const { rows: subs } = await oldClient.query('SELECT * FROM submissions WHERE user_id = 103');
    console.log('Migrating', subs.length, 'submissions...');

    for (const sub of subs) {
        const problemId = sub.contest_id && sub.problem_index ? `${sub.contest_id}:${sub.problem_index}` : sub.problem_id;
        
        try {
            await newClient.query(`
                INSERT INTO training_submissions (
                    user_id, problem_id, sheet_id, verdict, time_ms, memory_kb, 
                    language, source_code, submitted_at, ip_address, 
                    test_cases_passed, total_test_cases, compile_error, runtime_error,
                    tab_switches, paste_events, time_to_solve_seconds, attempt_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                ON CONFLICT DO NOTHING
            `, [
                202, 
                problemId,
                sub.sheet_id || '0',
                sub.verdict === 'Accepted' ? 'AC' : sub.verdict,
                sub.time_ms || 0,
                sub.memory_kb || 0,
                sub.language,
                sub.source_code,
                sub.submitted_at,
                sub.ip_address,
                sub.test_cases_passed || 0,
                sub.total_test_cases || 0,
                sub.compilation_error,
                sub.runtime_error,
                sub.tab_switches || 0,
                sub.paste_events || 0,
                sub.time_to_solve_seconds || 0,
                sub.attempt_number || 1
            ]);
        } catch (e) {
            console.error('Error inserting submission:', e.message);
        }
    }

    console.log('Done.');
    await oldClient.end();
    await newClient.end();
}
run();
