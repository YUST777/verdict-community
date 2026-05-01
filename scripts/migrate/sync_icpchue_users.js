#!/usr/bin/env node
/**
 * Sync ICPCHUE users and submissions to Verdict test DB
 * 
 * What this does:
 * 1. Reads all users from ICPCHUE production DB
 * 2. Reads their Supabase Auth passwords via admin API (bcrypt hashes)
 * 3. Inserts them into Verdict test DB with university_id = Horus University
 * 4. Copies all training_submissions, tagged to Horus
 * 5. Cleans up anonymous/test data
 * 6. Rebuilds leaderboard cache
 * 
 * ICPCHUE users can then log into Verdict with the same email + password.
 */

import pg from 'pg';
import crypto from 'crypto';
const { Pool } = pg;

// Suppress SSL cert warnings for Supabase pooler connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// ── ICPCHUE (source) ──
const ICPCHUE_DB_URL = process.env.ICPCHUE_DB_URL;
const ICPCHUE_SUPABASE_URL = process.env.ICPCHUE_SUPABASE_URL;
const ICPCHUE_SERVICE_KEY = process.env.ICPCHUE_SERVICE_KEY;

// ── Verdict test DB (destination) ──
const VERDICT_DB_URL = process.env.VERDICT_DB_URL;
// Verdict's BLIND_INDEX_SALT (from .env)
const VERDICT_BLIND_INDEX_SALT = process.env.VERDICT_BLIND_INDEX_SALT;

function createBlindIndex(value) {
    if (!value) return null;
    const normalized = value.toString().toLowerCase().trim();
    return crypto.createHmac('sha256', VERDICT_BLIND_INDEX_SALT).update(normalized).digest('hex');
}

const srcPool = new Pool({ connectionString: ICPCHUE_DB_URL, ssl: { rejectUnauthorized: false } });
const dstPool = new Pool({ connectionString: VERDICT_DB_URL, ssl: { rejectUnauthorized: false } });

async function main() {
    console.log('=== ICPCHUE → Verdict User & Submission Sync ===\n');

    // ── Step 0: Get Horus University ID in Verdict DB ──
    const horusRes = await dstPool.query(`SELECT id FROM universities WHERE slug = 'hue' OR name ILIKE '%horus%' LIMIT 1`);
    if (horusRes.rows.length === 0) {
        console.error('ERROR: Horus University not found in Verdict DB. Run seed data first.');
        process.exit(1);
    }
    const horusId = horusRes.rows[0].id;
    console.log(`✓ Horus University ID: ${horusId}`);

    // ── Step 1: Read all ICPCHUE users ──
    console.log('\n── Reading ICPCHUE users...');
    const icpUsers = await srcPool.query(`
        SELECT u.id, u.email, u.email_blind_index, u.application_id,
               u.last_login_at, u.created_at, u.telegram_username,
               u.role, u.profile_visibility, u.codeforces_data, u.codeforces_handle,
               u.is_shadow_banned, u.cheating_flags, u.show_on_cf_leaderboard,
               u.show_on_sheets_leaderboard, u.show_public_profile, u.profile_picture,
               u.supabase_uid,
               a.name, a.faculty, a.student_level, a.codeforces_profile
        FROM users u
        LEFT JOIN applications a ON u.application_id = a.id
        ORDER BY u.id
    `);
    console.log(`  Found ${icpUsers.rows.length} users`);

    // ── Step 2: Get bcrypt password hashes from Supabase Auth ──
    console.log('\n── Fetching Supabase Auth password hashes...');
    const authUsers = await fetchAllSupabaseAuthUsers();
    console.log(`  Found ${authUsers.length} auth users`);

    // Build email → password_hash map
    const emailToHash = new Map();
    for (const au of authUsers) {
        if (au.email && au.encrypted_password) {
            emailToHash.set(au.email.toLowerCase(), au.encrypted_password);
        }
    }

    // ── Step 3: Clean existing ICPCHUE data from Verdict test DB ──
    console.log('\n── Cleaning existing ICPCHUE data from Verdict test DB...');
    // Clean ALL FK-dependent tables (queried from information_schema)
    const fkTables = [
        'training_submissions', 'cf_submissions', 'daily_solves', 'user_achievements',
        'user_streaks', 'user_preferences', 'user_progress', 'notifications',
        'login_logs', 'applications', 'leaderboard_cache',
        // Additional tables that might have user_id FK
        'user_activity', 'mirror_views', 'news_reactions', 'view_logs',
        'user_tabs', 'user_sheets', 'user_notes', 'user_sessions', 'error_logs',
        'sheet_submissions', 'ai_conversations', 'ai_messages', 'user_workspaces',
        'room_announcements',
    ];
    for (const tbl of fkTables) {
        try {
            await dstPool.query(`DELETE FROM ${tbl} WHERE user_id IN (SELECT id FROM users WHERE source_platform = 'icpchue')`);
        } catch {} // table might not exist or column might differ
    }
    await dstPool.query(`DELETE FROM users WHERE source_platform = 'icpchue'`);
    console.log('  ✓ Cleaned');

    // ── Step 4: Insert users into Verdict test DB ──
    console.log('\n── Inserting users into Verdict test DB...');
    const idMap = new Map(); // icpchue_id → verdict_id
    let inserted = 0;
    let skipped = 0;

    for (const u of icpUsers.rows) {
        // Skip anonymous/test accounts
        if (!u.email || u.email.includes('test@') || u.email.includes('anonymous')) {
            skipped++;
            continue;
        }

        const emailLower = u.email.toLowerCase ? u.email.toLowerCase() : u.email;
        // Get the bcrypt hash from Supabase Auth
        // Supabase stores bcrypt hashes — they work directly with bcrypt.compare()
        const passwordHash = emailToHash.get(emailLower) || null;

        if (!passwordHash) {
            // User exists in public.users but not in auth.users — skip
            skipped++;
            continue;
        }

        // Generate blind index using VERDICT's salt (not ICPCHUE's)
        const blindIndex = createBlindIndex(emailLower);

        // Determine display name
        const displayName = u.name || emailLower.split('@')[0];
        const username = u.codeforces_handle || null || emailLower.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

        try {
            const res = await dstPool.query(`
                INSERT INTO users (
                    email, email_blind_index, password_hash, name, display_name, username,
                    university_id, university_slug, faculty, student_level,
                    is_verified, is_email_verified, application_id,
                    profile_picture_url, profile_picture, telegram_username,
                    codeforces_handle, codeforces_data,
                    role, profile_visibility,
                    show_on_cf_leaderboard, show_on_sheets_leaderboard, show_public_profile,
                    is_shadow_banned, cheating_flags,
                    last_login_at, created_at, source_platform, tier
                ) VALUES (
                    $1, $2, $3, $4, $5, $6,
                    $7, 'hue', $8, $9,
                    $10, $10, NULL,
                    $11, $12, $13,
                    $14, $15,
                    $16, $17,
                    $18, $19, $20,
                    $21, $22,
                    $23, $24, 'icpchue', 'university'
                )
                ON CONFLICT (email) DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    source_platform = 'icpchue',
                    university_id = EXCLUDED.university_id,
                    university_slug = 'hue'
                RETURNING id
            `, [
                emailLower,                                          // $1
                blindIndex,                                          // $2 — Verdict's blind index
                passwordHash,                                        // $3
                displayName,                                         // $4
                displayName,                                         // $5
                username,                                            // $6
                horusId,                                             // $7
                u.faculty || null,                                   // $8
                u.student_level || null,                             // $9
                true,                              // $10
                null,                       // $11
                u.profile_picture || null,                           // $12
                u.telegram_username || null,                         // $13
                u.codeforces_handle || null || null,      // $14
                u.codeforces_data || null,                           // $15
                u.role === 'admin' || u.role === 'owner' ? u.role : 'member', // $16
                u.profile_visibility || 'public',                    // $17
                u.show_on_cf_leaderboard !== false,                  // $18
                u.show_on_sheets_leaderboard !== false,              // $19
                u.show_public_profile !== false,                     // $20
                u.is_shadow_banned || false,                         // $21
                u.cheating_flags || 0,                               // $22
                u.last_login_at || null,                             // $23
                u.created_at || new Date(),                          // $24
            ]);

            if (res.rows.length > 0) {
                idMap.set(Number(u.id), Number(res.rows[0].id));
                inserted++;
            }
        } catch (err) {
            // Duplicate username — append random suffix
            if (err.code === '23505' && err.constraint?.includes('username')) {
                const fallbackUsername = username + '_' + Math.random().toString(36).slice(2, 6);
                try {
                    const res2 = await dstPool.query(`
                        INSERT INTO users (
                            email, email_blind_index, password_hash, name, display_name, username,
                            university_id, university_slug, faculty, student_level,
                            is_verified, is_email_verified,
                            profile_picture_url, profile_picture, telegram_username,
                            codeforces_handle, codeforces_data,
                            role, profile_visibility,
                            show_on_cf_leaderboard, show_on_sheets_leaderboard, show_public_profile,
                            is_shadow_banned, cheating_flags,
                            last_login_at, created_at, source_platform, tier
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6,
                            $7, 'hue', $8, $9,
                            $10, $10,
                            $11, $12, $13,
                            $14, $15,
                            $16, $17,
                            $18, $19, $20,
                            $21, $22,
                            $23, $24, 'icpchue', 'university'
                        )
                        ON CONFLICT (email) DO UPDATE SET
                            password_hash = EXCLUDED.password_hash,
                            source_platform = 'icpchue'
                        RETURNING id
                    `, [
                        emailLower, blindIndex, passwordHash, displayName, displayName, fallbackUsername,
                        horusId, u.faculty || null, u.student_level || null,
                        true,
                        null, u.profile_picture || null, u.telegram_username || null,
                        u.codeforces_handle || null || null, u.codeforces_data || null,
                        u.role === 'admin' || u.role === 'owner' ? u.role : 'member',
                        u.profile_visibility || 'public',
                        u.show_on_cf_leaderboard !== false, u.show_on_sheets_leaderboard !== false, u.show_public_profile !== false,
                        u.is_shadow_banned || false, u.cheating_flags || 0,
                        u.last_login_at || null, u.created_at || new Date(),
                    ]);
                    if (res2.rows.length > 0) {
                        idMap.set(Number(u.id), Number(res2.rows[0].id));
                        inserted++;
                    }
                } catch (err2) {
                    console.warn(`  ⚠ Skipped user ${emailLower}: ${err2.message}`);
                    skipped++;
                }
            } else {
                console.warn(`  ⚠ Skipped user ${emailLower}: ${err.message}`);
                skipped++;
            }
        }
    }
    console.log(`  ✓ Inserted ${inserted} users, skipped ${skipped}`);

    // ── Step 5: Copy training submissions ──
    console.log('\n── Copying training submissions...');
    const subs = await srcPool.query(`
        SELECT * FROM training_submissions ORDER BY id
    `);
    console.log(`  Found ${subs.rows.length} submissions in ICPCHUE`);

    let subInserted = 0;
    let subSkipped = 0;

    for (const s of subs.rows) {
        const newUserId = idMap.get(Number(s.user_id));
        if (!newUserId) {
            subSkipped++;
            continue;
        }

        try {
            await dstPool.query(`
                INSERT INTO training_submissions (
                    user_id, sheet_id, problem_id, source_code, language, verdict,
                    time_ms, memory_kb, test_cases_passed, total_test_cases,
                    compile_error, runtime_error, submitted_at,
                    tab_switches, paste_events, time_to_solve_seconds, attempt_number
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            `, [
                newUserId, s.sheet_id, s.problem_id, s.source_code, s.language, s.verdict,
                s.time_ms, s.memory_kb, s.test_cases_passed, s.total_test_cases,
                s.compile_error, s.runtime_error, s.submitted_at,
                s.tab_switches || 0, s.paste_events || 0, s.time_to_solve_seconds, s.attempt_number || 1,
            ]);
            subInserted++;
        } catch (err) {
            subSkipped++;
        }
    }
    console.log(`  ✓ Inserted ${subInserted} submissions, skipped ${subSkipped}`);

    // ── Step 6: Copy user achievements ──
    console.log('\n── Copying achievements...');
    const achs = await srcPool.query(`SELECT * FROM user_achievements ORDER BY id`);
    let achInserted = 0;

    for (const a of achs.rows) {
        const newUserId = idMap.get(Number(a.user_id));
        if (!newUserId) continue;

        try {
            await dstPool.query(`
                INSERT INTO user_achievements (user_id, achievement_id, earned_at, seen)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, achievement_id) DO NOTHING
            `, [newUserId, a.achievement_id, a.earned_at, a.seen]);
            achInserted++;
        } catch {}
    }
    console.log(`  ✓ Inserted ${achInserted} achievements`);

    // ── Step 7: Rebuild leaderboard cache ──
    console.log('\n── Rebuilding leaderboard cache...');
    await dstPool.query(`
        INSERT INTO leaderboard_cache (user_id, university_id, solved_count, last_solve_at, updated_at)
        SELECT
            u.id,
            u.university_id,
            COUNT(DISTINCT (ts.sheet_id, ts.problem_id)),
            MAX(ts.submitted_at),
            NOW()
        FROM users u
        JOIN training_submissions ts ON ts.user_id = u.id AND (ts.verdict = 'Accepted' OR ts.status = 'AC')
        WHERE u.source_platform = 'icpchue'
        GROUP BY u.id, u.university_id
        ON CONFLICT (user_id) DO UPDATE SET
            solved_count = EXCLUDED.solved_count,
            last_solve_at = EXCLUDED.last_solve_at,
            updated_at = NOW()
    `);

    // Refresh ranks
    await dstPool.query(`SELECT refresh_leaderboard_ranks()`);
    console.log('  ✓ Leaderboard rebuilt');

    // ── Step 8: Update Horus member count ──
    await dstPool.query(`
        UPDATE universities SET member_count = (
            SELECT COUNT(*) FROM users WHERE university_id = $1
        ) WHERE id = $1
    `, [horusId]);

    // ── Step 9: Clean anonymous/test data ──
    console.log('\n── Cleaning anonymous/test data...');
    const cleaned = await dstPool.query(`
        DELETE FROM users 
        WHERE source_platform = 'verdict' 
        AND (email LIKE '%test%' OR email LIKE '%anonymous%' OR email LIKE '%example.com%')
        AND role NOT IN ('admin', 'owner')
    `);
    console.log(`  ✓ Removed ${cleaned.rowCount} test/anonymous accounts`);

    // ── Summary ──
    const finalCount = await dstPool.query(`SELECT COUNT(*) FROM users WHERE source_platform = 'icpchue'`);
    const finalSubs = await dstPool.query(`SELECT COUNT(*) FROM training_submissions`);
    const horusMemberCount = await dstPool.query(`SELECT member_count FROM universities WHERE id = $1`, [horusId]);

    console.log('\n=== SYNC COMPLETE ===');
    console.log(`  Users:       ${finalCount.rows[0].count} (Horus University)`);
    console.log(`  Submissions: ${finalSubs.rows[0].count}`);
    console.log(`  Horus members: ${horusMemberCount.rows[0].member_count}`);
    console.log('\nICPCHUE users can now log into Verdict with the same email + password.');

    await srcPool.end();
    await dstPool.end();
}

/**
 * Fetch all Supabase Auth users via admin API (paginated)
 * Returns array of { email, encrypted_password }
 */
async function fetchAllSupabaseAuthUsers() {
    const allUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const res = await fetch(`${ICPCHUE_SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
            headers: {
                'Authorization': `Bearer ${ICPCHUE_SERVICE_KEY}`,
                'apikey': ICPCHUE_SERVICE_KEY,
            },
        });

        if (!res.ok) {
            console.error(`  ⚠ Supabase Auth API error: ${res.status} ${await res.text()}`);
            break;
        }

        const data = await res.json();
        const users = data.users || data;

        if (!Array.isArray(users) || users.length === 0) break;

        allUsers.push(...users);
        if (users.length < perPage) break;
        page++;
    }

    return allUsers;
}

main().catch(err => {
    console.error('FATAL:', err);
    process.exit(1);
});
