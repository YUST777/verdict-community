const { Client } = require('pg');
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function reset() {
    const client = new Client({ connectionString: NEW_DB_URL });
    await client.connect();

    console.log('Generating random numeric handles for all users...');
    
    const res = await client.query('SELECT id FROM users');
    const users = res.rows;

    for (const user of users) {
        let unique = false;
        let username = '';
        
        while (!unique) {
            username = Math.floor(100000 + Math.random() * 900000).toString();
            const check = await client.query('SELECT 1 FROM users WHERE username = $1', [username]);
            if (check.rows.length === 0) unique = true;
        }

        await client.query('UPDATE users SET username = $1 WHERE id = $2', [username, user.id]);
        process.stdout.write('.');
    }

    console.log('\nAll users updated with numeric handles.');
    await client.end();
}

reset().catch(console.error);
