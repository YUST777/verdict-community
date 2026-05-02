const { Client } = require('pg');

async function updateUniversityStats() {
    const client = new Client({
        connectionString: "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
    });

    try {
        await client.connect();

        console.log('Syncing university member counts...');
        await client.query(`
            UPDATE universities u
            SET member_count = (
                SELECT COUNT(*) FROM users us WHERE us.university_id = u.id
            )
        `);

        console.log('Syncing university total solves...');
        await client.query(`
            UPDATE universities u
            SET total_solves = (
                SELECT COALESCE(SUM(lc.solved_count), 0)
                FROM users us
                JOIN leaderboard_cache lc ON lc.user_id = us.id
                WHERE us.university_id = u.id
            )
        `);

        console.log('Update complete.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

updateUniversityStats();
