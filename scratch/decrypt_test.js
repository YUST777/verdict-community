const crypto = require('crypto');

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
        return decrypted.toString('utf8') || null;
    } catch (err) {
        return null;
    }
}

const key = 'j1u3NhRK6KqcJkkHiNW+Z1S9PEPiXr9RhplStQlCmIs=';
const encrypted = process.argv[2];

if (encrypted) {
    console.log(decryptLegacyCryptoJS(encrypted, key));
}
