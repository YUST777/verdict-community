import CryptoJS from 'crypto-js';

const encryptionKey = process.env.DB_ENCRYPTION_KEY;

if (!encryptionKey) {
    console.error('❌ ERROR: DB_ENCRYPTION_KEY not set in environment variables');
}

export const encrypt = (text: string | null): string | null => {
    if (!text || !encryptionKey) return null;
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

export const decrypt = (encryptedText: string | null): string | null => {
    if (!encryptedText || !encryptionKey) return null;

    // Check if data is already decrypted (not in encrypted format)
    // Encrypted data starts with "U2FsdGVkX1" (CryptoJS format) or is much longer
    if (typeof encryptedText === 'string') {
        // If it's already a plain number, phone, or email format, return as-is
        if (/^\+?\d+$/.test(encryptedText) && encryptedText.length <= 15) {
            return encryptedText;
        }
        if (encryptedText.includes('@') && encryptedText.length <= 255) {
            return encryptedText;
        }
        // If it doesn't look like AES string (usually starts with U2FsdGVkX1), return as is
        if (!encryptedText.startsWith('U2FsdGVkX1')) {
            return encryptedText;
        }
    }

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || encryptedText; // Fallback to original if empty (failed decrypt)
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText; // Return original on error
    }
};

// Hash email for O(1) lookups (SHA256, deterministic)
// DEPRECATED: Use createBlindIndex instead - this doesn't match Express
// Used instead of O(n) decrypt-and-compare scans
export const hashEmail = (email: string | null): string | null => {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    return CryptoJS.SHA256(normalized).toString(CryptoJS.enc.Hex);
};

// Create blind index for O(1) lookups (HMAC-SHA256, matches Express backend)
// Uses BLIND_INDEX_SALT from environment (falls back to DB_ENCRYPTION_KEY)
const blindIndexSalt = process.env.BLIND_INDEX_SALT || encryptionKey;

export const createBlindIndex = (value: string | null): string | null => {
    if (!value || !blindIndexSalt) return null;
    const normalized = value.toString().toLowerCase().trim();
    return CryptoJS.HmacSHA256(normalized, blindIndexSalt).toString(CryptoJS.enc.Hex);
};
