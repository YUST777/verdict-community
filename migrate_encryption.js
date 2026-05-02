const { Client } = require('pg');
const crypto = require('crypto');
const Cryptr = require('cryptr');

// Setup keys
const OLD_ENCRYPTION_KEY = 'j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=';
const NEW_ENCRYPTION_KEY = '2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3';
const NEW_BLIND_INDEX_SALT = 'e35818611de00c9a81fea42014a142e8df07334ce80e92fabff5ff1d73f9440f';
const DB_URL = 'postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

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
    if (!b64 || !b64.startsWith('U2FsdGVkX1')) return null;
    try {
        const raw = Buffer.from(b64, 'base64');
        const salt = raw.subarray(8, 16);
        const ct = raw.subarray(16);
        const derived = evpBytesToKey(Buffer.from(OLD_ENCRYPTION_KEY, 'utf8'), salt, 32, 16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', derived.key, derived.iv);
        decipher.setAutoPadding(true);
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        return null;
    }
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
    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    const { rows } = await client.query("SELECT id, email, name, display_name, student_id_encrypted, national_id_encrypted, telephone_encrypted FROM users WHERE email LIKE 'U2FsdGVkX1%'");
    console.log(`Found ${rows.length} legacy users to re-encrypt`);

    let successCount = 0;

    for (const row of rows) {
        try {
            const emailPlain = decryptLegacyCryptoJS(row.email);
            if (!emailPlain) {
                console.log(`Failed to decrypt email for user ${row.id}`);
                continue;
            }

            const namePlain = decryptLegacyCryptoJS(row.name);
            const displayPlain = decryptLegacyCryptoJS(row.display_name);
            const studentIdPlain = decryptLegacyCryptoJS(row.student_id_encrypted);
            const nationalIdPlain = decryptLegacyCryptoJS(row.national_id_encrypted);
            const phonePlain = decryptLegacyCryptoJS(row.telephone_encrypted);

            const updates = {
                email: encryptNew(emailPlain),
                email_blind_index: createNewBlindIndex(emailPlain),
                name: encryptNew(namePlain),
                display_name: encryptNew(displayPlain),
                student_id_encrypted: encryptNew(studentIdPlain),
                student_id_blind_index: createNewBlindIndex(studentIdPlain),
                national_id_encrypted: encryptNew(nationalIdPlain),
                national_id_blind_index: createNewBlindIndex(nationalIdPlain),
                telephone_encrypted: encryptNew(phonePlain),
                telephone_blind_index: createNewBlindIndex(phonePlain),
            };

            const setClause = [];
            const values = [];
            let i = 1;
            for (const [k, v] of Object.entries(updates)) {
                if (v !== null) {
                    setClause.push(`${k} = $${i}`);
                    values.push(v);
                    i++;
                } else if (k.includes('blind_index') || k.includes('encrypted') || k === 'name' || k === 'display_name') {
                   // don't overwrite with null if it was null
                }
            }
            
            values.push(row.id);

            await client.query(`UPDATE users SET ${setClause.join(', ')} WHERE id = $${i}`, values);
            successCount++;
        } catch (e) {
            console.error(`Error processing user ${row.id}:`, e);
        }
    }

    console.log(`Successfully re-encrypted ${successCount} users.`);
    await client.end();
}

run().catch(console.error);
