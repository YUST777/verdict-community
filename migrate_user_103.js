const { Client } = require('pg');
const crypto = require('crypto');
const Cryptr = require('cryptr');

const OLD_DB_URL = 'postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';
const NEW_DB_URL = 'postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

const OLD_ENCRYPTION_KEY = 'j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=';
const NEW_ENCRYPTION_KEY = '2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3';
const NEW_BLIND_INDEX_SALT = 'e35818611de00c9a81fea42014a142e8df07334ce80e92fabff5ff1d73f9440f';

const cryptr = new Cryptr(NEW_ENCRYPTION_KEY);

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

function decryptLegacyCryptoJS(b64) {
    if (!b64 || !b64.startsWith('U2FsdGVkX1')) return b64;
    try {
        const raw = Buffer.from(b64, 'base64');
        const salt = raw.subarray(8, 16);
        const ct = raw.subarray(16);
        const derived = evpBytesToKey(Buffer.from(OLD_ENCRYPTION_KEY, 'utf8'), salt, 32, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', derived.key, derived.iv);
        decipher.setAutoPadding(true);
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) { return null; }
}

function encryptNew(text) {
    if (!text) return null;
    return cryptr.encrypt(text);
}

function createNewBlindIndex(text) {
    if (!text) return null;
    return crypto.createHmac('sha256', NEW_BLIND_INDEX_SALT).update(text.trim().toLowerCase()).digest('hex');
}

async function run() {
    const oldClient = new Client({ connectionString: OLD_DB_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_DB_URL });
    
    await oldClient.connect();
    await newClient.connect();

    // 1. Get user 103 from Old DB
    const { rows: oldUsers } = await oldClient.query('SELECT * FROM public.users WHERE id = 103');
    const oldUser = oldUsers[0];

    // Get old password from auth.users
    const { rows: authRows } = await oldClient.query('SELECT encrypted_password FROM auth.users WHERE id = $1', [oldUser.supabase_uid]);
    const oldPassword = authRows[0]?.encrypted_password;

    // 2. User 201 was already deleted via psql
    console.log('Deleted conflicting new Verdict account (id=201)');

    // 3. Insert user into New DB
    const emailPlain = decryptLegacyCryptoJS(oldUser.email);
    const namePlain = decryptLegacyCryptoJS(oldUser.name);
    const displayPlain = decryptLegacyCryptoJS(oldUser.display_name);

    const res = await newClient.query(`
        INSERT INTO users (
            email, email_blind_index, name, display_name,
            password_hash, original_id, source_platform, university_id
        ) VALUES ($1, $2, $3, $4, $5, $6, 'verdict', $7)
        RETURNING id
    `, [
        encryptNew(emailPlain),
        createNewBlindIndex(emailPlain),
        encryptNew(namePlain),
        encryptNew(displayPlain),
        oldPassword,
        103,
        oldUser.university_id
    ]);

    const newId = res.rows[0].id;
    console.log('Imported user 103 to new ID', newId);

    // 4. Migrate user's old data!
    console.log('Running bash script to migrate data for this user specifically...');
    
    await oldClient.end();
    await newClient.end();
}
run().catch(console.error);
