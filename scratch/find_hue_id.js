const crypto = require('crypto');
const { Client } = require('pg');

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

function decryptLegacyCryptoJS(b64, key) {
    try {
        const raw = Buffer.from(b64, 'base64');
        if (raw.subarray(0, 8).toString('utf8') !== 'Salted__') return null;
        const salt = raw.subarray(8, 16);
        const ct = raw.subarray(16);
        const derived = evpBytesToKey(Buffer.from(key, 'utf8'), salt, 32, 16);
        const decipher = crypto.createDecipheriv('aes-256-cbc', derived.key, derived.iv);
        decipher.setAutoPadding(true);
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (e) {
        return null;
    }
}

async function run() {
    const client = new Client({
        connectionString: 'postgresql://postgres.jokgfcglqqrzfitfnynu:J6cLzUxvmOCtug%40X0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require',
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    
    const res = await client.query('SELECT id, email FROM users');
    for (const row of res.rows) {
        const email = decryptLegacyCryptoJS(row.email, 'j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=');
        if (email === '8241043@horus.edu.eg') {
            console.log(JSON.stringify({ id: row.id, email: email }));
            break;
        }
    }
    await client.end();
}

run();
