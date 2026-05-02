const { Client } = require('pg');
const Cryptr = require('cryptr');
const crypto = require('crypto');

const ENCRYPTION_KEY = '2aee5a3be162303ef1764e40f3cf8e667d0ee82b0f57d742104483e2dbe064a3';
const cryptr = new Cryptr(ENCRYPTION_KEY);

function decrypt(ciphertext) {
    if (!ciphertext) return null;
    if (ciphertext.startsWith('U2FsdGVkX1')) return 'LEGACY_CRYPTOJS';
    if (ciphertext.startsWith('aes256gcm:')) return 'LEGACY_GCM';
    try {
        return cryptr.decrypt(ciphertext);
    } catch (err) {
        return null;
    }
}

async function search() {
    const client = new Client({
        connectionString: "postgresql://postgres.rytpfqlvzcfthnavybwx:N7H5qV7ApzSv@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
    });
    await client.connect();
    
    const res = await client.query('SELECT id, email, email_blind_index FROM public.users');
    console.log(`Found ${res.rows.length} users.`);
    
    for (const row of res.rows) {
        const email = decrypt(row.email);
        if (email && email.includes('horus.edu.eg')) {
            console.log(`Match! ID: ${row.id}, Email: ${email}, BlindIndex: ${row.email_blind_index}`);
        }
    }
    
    await client.end();
}

search();
