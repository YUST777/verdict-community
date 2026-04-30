const { Pool } = require('pg');
const fs = require('fs');

// Test DB connection (Supabase MCP is connected to this)
const pool = new Pool({
    connectionString: 'postgresql://postgres.rytpfqlvzcfthnavybwx:OIRX8kPfaPSE0R6P@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

// Tables to import in order (respecting foreign keys)
const tables = [
    { name: 'applications', hasIdentity: true },
    { name: 'page_views', hasIdentity: false },
    { name: 'recap_2025', hasIdentity: false },
    // These depend on users table
    { name: 'login_logs', hasIdentity: true },
    { name: 'news_reactions', hasIdentity: true, needsIntUserId: true },
    { name: 'user_achievements', hasIdentity: true },
    { name: 'training_submissions', hasIdentity: true },
    { name: 'view_logs', hasIdentity: true }
];

function escapeValue(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
    return `'${String(val).replace(/'/g, "''")}'`;
}

async function importTable(tableInfo) {
    const { name, hasIdentity, needsIntUserId } = tableInfo;
    const filePath = `/tmp/icpchue_${name}.json`;
    
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${name} - file not found`);
        return { table: name, count: 0, skipped: true };
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.length === 0) {
        console.log(`Skipping ${name} - no data`);
        return { table: name, count: 0, empty: true };
    }
    
    console.log(`Importing ${name}: ${data.length} rows...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of data) {
        try {
            // Get column names and values, excluding 'id' for identity columns
            const columns = Object.keys(row).filter(k => !hasIdentity || k !== 'id');
            const values = columns.map(col => {
                let val = row[col];
                // Handle user_id references - map from ICPCHUE original_id
                if (col === 'user_id' && val !== null) {
                    // We'll need to look up the new user id based on original_id
                    // For now, just use the value as-is since we set original_id during user migration
                    return val;
                }
                return escapeValue(val);
            });
            
            const sql = `INSERT INTO public.${name} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`;
            await pool.query(sql);
            successCount++;
        } catch (err) {
            errorCount++;
            if (errorCount <= 3) {
                console.error(`  Error row: ${err.message}`);
            }
        }
    }
    
    console.log(`  Success: ${successCount}, Errors: ${errorCount}`);
    return { table: name, count: successCount, errors: errorCount };
}

async function main() {
    const results = [];
    
    for (const tableInfo of tables) {
        try {
            const result = await importTable(tableInfo);
            results.push(result);
        } catch (err) {
            console.error(`Failed to import ${tableInfo.name}:`, err.message);
            results.push({ table: tableInfo.name, error: err.message });
        }
    }
    
    console.log('\n=== Import Summary ===');
    console.log(JSON.stringify(results, null, 2));
    await pool.end();
}

main();
