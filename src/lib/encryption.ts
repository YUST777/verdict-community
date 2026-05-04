import Cryptr from 'cryptr';
import crypto from 'crypto';
import speakeasy from 'speakeasy';

/**
 * Application-level field encryption using `cryptr` (AES-256-GCM + PBKDF2).
 * https://github.com/MauriceButler/cryptr
 *
 * NEW data: cryptr format (hex-encoded salt + iv + authTag + ciphertext)
 * OLD data: Legacy CryptoJS AES-CBC format (U2FsdGVkX1...) still decryptable
 *           for backward compatibility until a full data migration is done.
 */

const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    console.warn('⚠️ WARNING: DB_ENCRYPTION_KEY not set. Encryption/decryption will fail.');
}

const BLIND_INDEX_SALT = process.env.BLIND_INDEX_SALT || ENCRYPTION_KEY;
if (!BLIND_INDEX_SALT) {
    console.warn('⚠️ WARNING: BLIND_INDEX_SALT not set. Blind index lookups will fail.');
}

const TOTP_SECRET = process.env.TOTP_SECRET;

// cryptr instance — handles AES-256-GCM with PBKDF2 key derivation
const cryptr = ENCRYPTION_KEY ? new Cryptr(ENCRYPTION_KEY) : null;

// ─── Encrypt (via cryptr) ───────────────────────────────────────────

export const encrypt = (text: string | null | undefined): string | null => {
    if (!text || !cryptr) return null;
    try {
        return cryptr.encrypt(text);
    } catch (err) {
        console.error('[encrypt] Failed:', err);
        return null;
    }
};

// ─── Decrypt: cryptr first, legacy CryptoJS fallback ────────────────

export const decrypt = (ciphertext: string | null | undefined, customKey?: string): string | null => {
    if (!ciphertext) return null;

    const key = customKey || ENCRYPTION_KEY;

    // Legacy CryptoJS format starts with "U2FsdGVkX1" (base64 of "Salted__")
    if (ciphertext.startsWith('U2FsdGVkX1')) {
        return decryptLegacyCryptoJS(ciphertext, key);
    }

    // Legacy hand-rolled AES-256-GCM format from previous code
    if (ciphertext.startsWith('aes256gcm:')) {
        return decryptLegacyGCM(ciphertext, key);
    }

    // Current format: cryptr (hex string)
    if (!cryptr || customKey) {
        // If we have a custom key, we need a new cryptr instance
        if (customKey) {
            try {
                const customCryptr = new Cryptr(customKey);
                return customCryptr.decrypt(ciphertext);
            } catch { return null; }
        }
        return null;
    }

    try {
        // Simple hex check for cryptr format
        if (!/^[0-9a-fA-F]+$/.test(ciphertext)) {
            return null;
        }
        return cryptr.decrypt(ciphertext);
    } catch (err) {
        // If it's not a valid cryptr format, don't crash
        return null;
    }
};

// ─── Legacy: CryptoJS AES-CBC decrypt (read-only, for old DB data) ──

function decryptLegacyCryptoJS(b64: string, keyToUse?: string): string | null {
    const key = keyToUse || ENCRYPTION_KEY;
    if (!key) return null;
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
        console.error('[decryptLegacyCryptoJS] Failed:', err);
        return null;
    }
}

/** OpenSSL EVP_BytesToKey — needed to read old CryptoJS data */
function evpBytesToKey(password: Buffer, salt: Buffer, keyLen: number, ivLen: number) {
    const blocks: Buffer[] = [];
    let prev = Buffer.alloc(0);
    while (Buffer.concat(blocks).length < keyLen + ivLen) {
        prev = crypto.createHash('md5').update(prev).update(password).update(salt).digest();
        blocks.push(prev);
    }
    const d = Buffer.concat(blocks);
    return { key: d.subarray(0, keyLen), iv: d.subarray(keyLen, keyLen + ivLen) };
}

// ─── Legacy: hand-rolled AES-256-GCM decrypt (from previous refactor) ──

function decryptLegacyGCM(ciphertext: string, keyToUse?: string): string | null {
    const keyString = keyToUse || ENCRYPTION_KEY;
    if (!keyString) return null;
    try {
        const packed = Buffer.from(ciphertext.slice(10), 'base64');
        if (packed.length < 28) return null;

        const iv = packed.subarray(0, 12);
        const authTag = packed.subarray(12, 28);
        const ct = packed.subarray(28);
        const key = crypto.createHash('sha256').update(keyString).digest();

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        console.error('[decryptLegacyGCM] Failed:', err);
        return null;
    }
}

// ─── Blind index (HMAC-SHA256 via Node crypto — standard, not custom) ──

export const createBlindIndex = (value: string | null | undefined): string | null => {
    if (!value || !BLIND_INDEX_SALT) return null;
    const normalized = value.toString().toLowerCase().trim();
    return crypto.createHmac('sha256', BLIND_INDEX_SALT).update(normalized).digest('hex');
};

// ─── TOTP verification (via speakeasy — established lib) ────────────

export const verifyTOTP = (token: string): boolean => {
    if (!TOTP_SECRET) {
        console.error('TOTP_SECRET is not defined');
        return false;
    }
    try {
        return speakeasy.totp.verify({
            secret: TOTP_SECRET,
            encoding: 'base32',
            token,
            window: 2,
        });
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
};

// ─── OTP Generation (for email verification) ────────────────────────

export const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// ─── Hash OTP for storage (don't store plaintext OTPs) ──────────────

export const hashOTP = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};
