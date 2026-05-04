const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: 'postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const tables = [
    'applications',
    'api_access_log',
    'email_verification_otps',
    'login_logs',
    'news_reactions',
    'page_views',
    'password_resets',
    'problem_test_cases',
    'recap_2025',
    'training_submissions',
    'user_achievements',
    'view_logs',
    'website_analytics'
];

async function exportTable(tableName) {
    try {
        const result = await pool.query(`SELECT * FROM public.${tableName}`);
        console.log(`${tableName}: ${result.rows.length} rows`);
        fs.writeFileSync(`/tmp/icpchue_${tableName}.json`, JSON.stringify(result.rows, null, 2));
        return { table: tableName, count: result.rows.length };
    } catch (err) {
        console.error(`Error exporting ${tableName}:`, err.message);
        return { table: tableName, count: 0, error: err.message };
    }
}

async function main() {
    const results = [];
    for (const table of tables) {
        const result = await exportTable(table);
        results.push(result);
    }
    console.log('\n=== Export Summary ===');
    console.log(JSON.stringify(results, null, 2));
    await pool.end();
}

main();
