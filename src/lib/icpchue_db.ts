import pg from 'pg';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { Pool } = pg;

let icpchuePool: pg.Pool | null = null;

export function getIcpchuePool(): pg.Pool {
    if (!icpchuePool) {
        const connectionString = process.env.ICPCHUE_DATABASE_URL;
        if (!connectionString) {
            // Return dummy pool or throw error
            throw new Error('ICPCHUE_DATABASE_URL is not set');
        }

        icpchuePool = new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            },
            max: 5, // Even smaller pool for secondary DB
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });

        icpchuePool.on('error', (err) => {
            console.error('[ICPCHUE-DB] Unexpected error on idle client:', err.message);
        });
    }
    return icpchuePool;
}

export async function icpchueQuery(text: string, params?: (string | number | boolean | null | object)[]) {
    try {
        const pool = getIcpchuePool();
        return pool.query(text, params);
    } catch (err: any) {
        console.error('[ICPCHUE-DB] Query failed:', err.message);
        return { rows: [] };
    }
}
