const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate_linter_fixes() {
    try {
        console.log('Applying Linter Fixes...');

        // 1. Drop and Recreate `Enable all for service_role` policies correctly using `TO service_role`
        // instead of checking auth.role() dynamically inside the policy. This solves both auth_rls_initplan and multiple_permissive_policies.
        const serviceRoleTables = [
            'users',
            'ai_conversations',
            'ai_messages',
            'ai_user_preferences',
            'ai_usage_logs',
            'ai_subscription_plans',
            'ai_user_subscriptions',
            'ai_user_usage_tracking'
        ];

        for (const table of serviceRoleTables) {
            console.log(`Fixing service_role policy for ${table}...`);
            await pool.query(`DROP POLICY IF EXISTS "Enable all for service_role" ON public.${table}`);
            await pool.query(`
                CREATE POLICY "Enable all for service_role" ON public.${table}
                AS PERMISSIVE FOR ALL TO service_role, postgres
                USING (true)
                WITH CHECK (true);
            `);
        }

        // 2. Fix auth_rls_initplan by wrapping auth.uid() in (SELECT auth.uid()) for user policies
        const userPolicies = [
            { table: 'user_workspaces', policy: 'Users can only access their own workspaces' },
            { table: 'ai_conversations', policy: 'Users can only access their own AI conversations' },
            { table: 'ai_user_preferences', policy: 'Users can only access their own AI preferences' }
        ];

        for (const { table, policy } of userPolicies) {
            console.log(`Fixing auth.uid() inside ${table}...`);
            await pool.query(`DROP POLICY IF EXISTS "${policy}" ON public.${table}`);
            await pool.query(`
                CREATE POLICY "${policy}" ON public.${table}
                FOR ALL
                USING (
                    user_id IN (SELECT id FROM public.users WHERE auth_id = (SELECT auth.uid()))
                );
            `);
        }

        // 3. Drop duplicate indexes
        console.log('Dropping duplicate indexes...');
        await pool.query(`DROP INDEX IF EXISTS public.idx_ai_user_subscriptions_user_id`);
        await pool.query(`ALTER TABLE public.mirror_problems DROP CONSTRAINT IF EXISTS mirror_problems_unique_problem`);

        console.log('Linter Fixes applied successfully!');
    } catch (err) {
        console.error('Linter Fixes failed:', err);
    } finally {
        await pool.end();
    }
}

migrate_linter_fixes();
