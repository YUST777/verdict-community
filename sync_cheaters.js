
const { Client } = require('pg');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const OLD_DB_URL = "postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function syncCheatFlags() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });
    await oldClient.connect();
    await newClient.connect();

    console.log("Connected. Syncing cheat flags...");

    const oldUsers = await oldClient.query("SELECT supabase_uid, is_shadow_banned, cheating_flags FROM users WHERE is_shadow_banned = true OR cheating_flags > 0");
    console.log(`Found ${oldUsers.rows.length} flagged users.`);

    for (const u of oldUsers.rows) {
        if (!u.supabase_uid) continue;
        const res = await newClient.query(
            "UPDATE users SET is_shadow_banned = $1, cheating_flags = $2 WHERE auth_id = $3 RETURNING id",
            [u.is_shadow_banned, u.cheating_flags, u.supabase_uid]
        );
        if (res.rows.length > 0) {
            console.log(`Updated user ${res.rows[0].id} with flags: ${u.cheating_flags}, banned: ${u.is_shadow_banned}`);
        }
    }

    // Also update leaderboard_cache for these users?
    // Actually, the leaderboard API should just exclude them.

    console.log("Sync complete!");
    await oldClient.end();
    await newClient.end();
}

syncCheatFlags();
