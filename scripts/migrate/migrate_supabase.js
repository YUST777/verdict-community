const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Starting Migration...');

        // 1. Add auth_id to users
        console.log('Adding auth_id to users...');
        await pool.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
        `);

        // 2. Create user_workspaces
        console.log('Creating user_workspaces...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS public.user_workspaces (
                user_id bigint REFERENCES public.users(id) ON DELETE CASCADE,
                problem_id text NOT NULL,
                saved_code text,
                selected_language text,
                custom_test_cases jsonb,
                whiteboard_data jsonb,
                updated_at timestamp with time zone DEFAULT now(),
                PRIMARY KEY (user_id, problem_id)
            );
        `);

        // 3. Add AI Context Columns
        console.log('Adding AI context columns to ai_conversations...');
        await pool.query(`
            ALTER TABLE public.ai_conversations
            ADD COLUMN IF NOT EXISTS reference_solution_code text,
            ADD COLUMN IF NOT EXISTS full_problem_context jsonb;
        `);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
