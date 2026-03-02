const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate_rls() {
    try {
        console.log('Applying RLS policies...');

        await pool.query('ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;');
        await pool.query('ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;');
        await pool.query('ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;');

        const policyWorkspace = `
            CREATE POLICY "Users can only access their own workspaces" ON public.user_workspaces
            FOR ALL
            USING (
                user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
            );
        `;

        const policyConversations = `
            CREATE POLICY "Users can only access their own AI conversations" ON public.ai_conversations
            FOR ALL
            USING (
                user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
            );
        `;

        const policyPreferences = `
            CREATE POLICY "Users can only access their own AI preferences" ON public.ai_user_preferences
            FOR ALL
            USING (
                user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
            );
        `;

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'user_workspaces' AND policyname = 'Users can only access their own workspaces'
                ) THEN
                    ${policyWorkspace}
                END IF;
            END
            $$;
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can only access their own AI conversations'
                ) THEN
                    ${policyConversations}
                END IF;
            END
            $$;
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE tablename = 'ai_user_preferences' AND policyname = 'Users can only access their own AI preferences'
                ) THEN
                    ${policyPreferences}
                END IF;
            END
            $$;
        `);

        console.log('RLS applied successfully!');
    } catch (err) {
        console.error('RLS Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate_rls();
