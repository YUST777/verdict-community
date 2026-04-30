const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Starting AI Chat Migration...');

        console.log('Adding ai_chat_messages and ai_chat_tabs to user_workspaces...');
        await pool.query(`
            ALTER TABLE public.user_workspaces
            ADD COLUMN IF NOT EXISTS ai_chat_messages jsonb,
            ADD COLUMN IF NOT EXISTS ai_chat_tabs jsonb;
        `);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
