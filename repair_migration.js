
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// --- CONFIG ---
const OLD_DB_URL = "postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function run() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });

    await oldClient.connect();
    await newClient.connect();

    console.log("Connected to both databases.");

    // 1. Get all HUE users in Verdict
    const hueUsersRes = await newClient.query("SELECT id, email_blind_index FROM users WHERE university_id = 1");
    console.log(`Found ${hueUsersRes.rows.length} HUE users in Verdict.`);

    // 2. Clear their training_submissions to start fresh
    const userIds = hueUsersRes.rows.map(u => u.id);
    if (userIds.length > 0) {
        await newClient.query("DELETE FROM training_submissions WHERE user_id = ANY($1)", [userIds]);
        console.log("Cleared existing training_submissions for HUE users.");
    }

    // 3. For each user, find their old ID and migrate submissions
    for (const hueUser of hueUsersRes.rows) {
        // Find old user ID using email_blind_index (wait, old DB doesn't have blind index)
        // I'll need to map them another way. 
        // Actually, during the first migration I used the email.
        // Let's just fetch all users from old DB and match.
    }

    // Wait! Let's just do a join-like migration.
    const oldUsersRes = await oldClient.query("SELECT id, email FROM users");
    const emailToOldId = new Map();
    // I need to decrypt old emails first... this is slow.
    // Better: migrate by matching the new DB users back to old DB.
    
    // I'll reuse the logic from migrate_all_hue.js but focus ONLY on submissions and FIXING the mapping.
    // ...
}

// Actually, I'll just write a cleaner version.
async function repairSubmissions() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });
    await oldClient.connect();
    await newClient.connect();

    // 1. Delete all training_submissions for university 1 users
    await newClient.query(`
        DELETE FROM training_submissions 
        WHERE user_id IN (SELECT id FROM users WHERE university_id = 1)
    `);
    console.log("Cleared HUE submissions.");

    // 2. Fetch all legacy users and their new IDs
    // Since I already migrated them, I can match them by their auth_id (supabase_uid)
    const users = await newClient.query("SELECT id, auth_id FROM users WHERE university_id = 1 AND auth_id IS NOT NULL");
    
    for (const user of users.rows) {
        const oldUserRes = await oldClient.query("SELECT id FROM users WHERE supabase_uid = $1", [user.auth_id]);
        if (oldUserRes.rows.length === 0) continue;
        const oldUserId = oldUserRes.rows[0].id;

        const subRes = await oldClient.query("SELECT * FROM submissions WHERE user_id = $1", [oldUserId]);
        console.log(`Migrating ${subRes.rows.length} submissions for Verdict user ${user.id} (Old ID: ${oldUserId})...`);

        const sortedSubs = subRes.rows.sort((a, b) => {
            // Prioritize rows with contest_id
            if (a.contest_id && !b.contest_id) return -1;
            if (!a.contest_id && b.contest_id) return 1;
            return 0;
        });

        const seenACs = new Set();

        for (const sub of sortedSubs) {
            const contestId = sub.contest_id || '0';
            const problemId = `${contestId}-${sub.problem_index || '0'}`;
            const sheetId = sub.sheet_id || '0';
            const timeKey = `${sub.submitted_at}-${sub.problem_index}`;

            if (sub.verdict === 'Accepted' || sub.verdict === 'AC') {
                if (seenACs.has(timeKey)) {
                    continue; // Skip duplicate solve at the same timestamp
                }
                seenACs.add(timeKey);
            }

            await newClient.query(
                "INSERT INTO training_submissions (user_id, sheet_id, problem_id, source_code, language, verdict, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
                [
                    user.id,
                    sheetId,
                    problemId,
                    sub.source_code || sub.code || '',
                    sub.language || 'C++',
                    sub.verdict === 'Accepted' ? 'AC' : sub.verdict,
                    sub.submitted_at || new Date()
                ]
            );
        }
    }

    console.log("Repair complete!");
    await oldClient.end();
    await newClient.end();
}

repairSubmissions();
