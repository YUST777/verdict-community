
const { Client } = require('pg');
const Cryptr = require('cryptr');
const crypto = require('crypto');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// --- CONFIG ---
const OLD_DB_URL = "postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require";
const NEW_DB_URL = "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

const OLD_DB_ENCRYPTION_KEY = "j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=";
const OLD_BLIND_INDEX_SALT = "j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=";

const NEW_DB_ENCRYPTION_KEY = "2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3";
const NEW_BLIND_INDEX_SALT = "e35818611de00c9a81fea42014a142e8df07334ce80e92fabff5ff1d73f9440f";

const cryptr = new Cryptr(NEW_DB_ENCRYPTION_KEY);

function createBlindIndex(value, salt) {
    if (!value || !salt) return null;
    const normalized = value.toString().toLowerCase().trim();
    return crypto.createHmac('sha256', salt).update(normalized).digest('hex');
}

function decryptLegacyCryptoJS(b64, key) {
    try {
        const raw = Buffer.from(b64, 'base64');
        if (raw.subarray(0, 8).toString('utf8') !== 'Salted__') return null;
        const salt = raw.subarray(8, 16);
        const ct = raw.subarray(16);
        const derived = evpBytesToKey(Buffer.from(key, 'utf8'), salt, 32, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', derived.key, derived.iv);
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
        return decrypted.toString('utf8') || null;
    } catch (err) {
        return null;
    }
}

function evpBytesToKey(password, salt, keyLen, ivLen) {
    const blocks = [];
    let prev = Buffer.alloc(0);
    while (Buffer.concat(blocks).length < keyLen + ivLen) {
        prev = crypto.createHash('md5').update(prev).update(password).update(salt).digest();
        blocks.push(prev);
    }
    const d = Buffer.concat(blocks);
    return { key: d.subarray(0, keyLen), iv: d.subarray(keyLen, keyLen + ivLen) };
}

async function run() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL, ssl: { rejectUnauthorized: false } });

    await oldClient.connect();
    await newClient.connect();

    console.log("Connected to both databases.");

    // 1. Get all users and their names
    const usersRes = await oldClient.query(`
        SELECT u.id, u.email, u.supabase_uid, a.name, a.national_id as nid, u.role
        FROM users u
        LEFT JOIN applications a ON a.id = u.application_id
    `);

    console.log(`Found ${usersRes.rows.length} users to migrate.`);

    for (const oldUser of usersRes.rows) {
        try {
            // Decrypt email if it's in legacy format
            let decryptedEmail = oldUser.email;
            if (decryptedEmail.startsWith('U2FsdGVkX1')) {
                decryptedEmail = decryptLegacyCryptoJS(decryptedEmail, OLD_DB_ENCRYPTION_KEY);
            }

            if (!decryptedEmail) {
                console.warn(`Could not decrypt email for user ${oldUser.id}`);
                continue;
            }

            const newEmailIndex = createBlindIndex(decryptedEmail, NEW_BLIND_INDEX_SALT);
            const encEmail = cryptr.encrypt(decryptedEmail);
            const encName = oldUser.name ? cryptr.encrypt(oldUser.name) : null;

            // Check if user exists in new DB
            const existingRes = await newClient.query(
                "SELECT id FROM users WHERE email_blind_index = $1",
                [newEmailIndex]
            );

            let userId;
            if (existingRes.rows.length > 0) {
                userId = existingRes.rows[0].id;
                console.log(`User ${decryptedEmail} already exists (ID: ${userId}). Updating...`);
                await newClient.query(
                    "UPDATE users SET university_id = 1, original_id = $1, name = COALESCE($2, name), display_name = COALESCE($2, display_name), auth_id = COALESCE($3, auth_id) WHERE id = $4",
                    [oldUser.id, encName, oldUser.supabase_uid, userId]
                );
            } else {
                console.log(`Creating user ${decryptedEmail}...`);
                const insertRes = await newClient.query(
                    "INSERT INTO users (email, email_blind_index, name, display_name, university_id, original_id, password_hash, auth_id, role, is_verified) VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8, true) RETURNING id",
                    [encEmail, newEmailIndex, encName, encName, oldUser.id, 'supabase-managed', oldUser.supabase_uid, oldUser.role || 'trainee']
                );
                userId = insertRes.rows[0].id;
            }

            // Migrate submissions
            const subRes = await oldClient.query("SELECT * FROM submissions WHERE user_id = $1", [oldUser.id]);
            console.log(`Migrating ${subRes.rows.length} submissions for user ${userId}...`);

            for (const sub of subRes.rows) {
                const verdict = sub.verdict === 'Accepted' ? 'AC' : sub.verdict;
                await newClient.query(
                    "INSERT INTO training_submissions (user_id, sheet_id, problem_id, source_code, language, verdict, submitted_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING",
                    [userId, sub.sheet_id || '0', sub.problem_id || '0', sub.code || '', sub.language || 'C++', verdict, sub.submitted_at]
                );
            }

        } catch (err) {
            console.error(`Error migrating user ${oldUser.id}:`, err.message);
        }
    }

    console.log("Migration complete!");
    await oldClient.end();
    await newClient.end();
}

run();
