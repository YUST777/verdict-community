#!/usr/bin/env node

/**
 * Fix user_tabs table schema
 * - Drop existing table if it has UUID type
 * - Recreate with INTEGER type matching users table
 */

const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pg;

async function main() {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL not found in .env');
        process.exit(1);
    }

    console.log('Connecting to database...');
    
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Check if table exists and what type user_id is
        const checkTable = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_tabs' AND column_name = 'user_id'
        `);

        if (checkTable.rows.length > 0) {
            const currentType = checkTable.rows[0].data_type;
            console.log(`Found user_tabs table with user_id type: ${currentType}`);

            if (currentType === 'uuid') {
                console.log('Dropping old table with UUID type...');
                await pool.query('DROP TABLE IF EXISTS user_tabs CASCADE');
                console.log('Old table dropped.');
            } else if (currentType === 'integer') {
                console.log('Table already has correct INTEGER type. No changes needed.');
                await pool.end();
                return;
            }
        } else {
            console.log('user_tabs table does not exist yet.');
        }

        // Create table with correct schema
        console.log('Creating user_tabs table with INTEGER type...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_tabs (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                tabs JSONB DEFAULT '[]'::jsonb,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        
        console.log('â user_tabs table created successfully with INTEGER type');
        console.log('â Foreign key constraint added to users(id)');

        // Verify the fix
        const verify = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'user_tabs'
            ORDER BY ordinal_position
        `);

        console.log('\nTable schema:');
        verify.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('\nDatabase connection closed.');
    }
}

main();
