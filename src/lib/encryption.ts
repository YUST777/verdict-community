import CryptoJS from 'crypto-js';
import crypto from 'crypto';

// Encryption key for sensitive data (application-level encryption)
const encryptionKey = process.env.DB_ENCRYPTION_KEY;
if (!encryptionKey) {
    console.warn('WARNING: DB_ENCRYPTION_KEY not set in process.env. Decryption will fail.');
}

// Blind index salt for O(1) lookups (separate from encryption key)
const blindIndexSalt = process.env.BLIND_INDEX_SALT || encryptionKey || 'fallback-salt';

// Encryption/Decryption functions for sensitive fields
export const encrypt = (text: string | null | undefined): string | null => {
    if (!text || !encryptionKey) return null;
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

// Simplified decrypt - no heuristic guessing
// If data is encrypted, decrypt it. If not, return null.
export const decrypt = (encryptedText: string | null | undefined): string | null => {
    if (!encryptedText || !encryptionKey) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // Empty result means decryption failed (wrong format or key)
        if (!decrypted || decrypted.trim() === '') {
            console.warn('Decryption returned empty - data may be corrupted or wrong key');
            return null;
        }

        return decrypted;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Decryption error:', message);
        return null;
    }
};

// Create blind index for O(1) lookups (prevents N decryption bottleneck)
// Uses HMAC-SHA256 for consistent, secure hashing
export const createBlindIndex = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const normalized = value.toString().toLowerCase().trim();
    return crypto.createHmac('sha256', blindIndexSalt).update(normalized).digest('hex');
};
