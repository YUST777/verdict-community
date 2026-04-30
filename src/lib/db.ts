import pg from 'pg';
const { Pool } = pg;

// Database pool singleton — optimized for Supabase Supavisor pooler.
//
// Since Supabase already runs a connection pooler (Supavisor on port 6543,
// or direct on 5432), we keep the client-side pool SMALL. The real pooling
// happens server-side at Supabase. Having a large pool here (20+) wastes
// connections and can hit Supabase's connection limit.
//
// Pool mode: transaction (Supabase default) — connections are returned
// to the pool after each transaction, not held for the session.
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL is not set');
        }

        pool = new Pool({
            connectionString,
            ssl: {
                // Supabase Supavisor pooler uses certificates that may not be in the
                // system CA bundle. For Supabase connections this is expected.
                // If migrating to a different DB provider, set this to true.
                rejectUnauthorized: false
            },
            // Small pool — Supavisor handles the real pooling upstream.
            max: 10,
            // Release idle connections after 30s
            idleTimeoutMillis: 30000,
            // Wait up to 10s for a connection
            connectionTimeoutMillis: 10000,
        });

        pool.on('error', (err) => {
            console.error('[DB] Unexpected error on idle client:', err.message);
        });
    }
    return pool;
}

export async function query(text: string, params?: (string | number | boolean | null | object)[]) {
    const pool = getPool();
    return pool.query(text, params);
}
