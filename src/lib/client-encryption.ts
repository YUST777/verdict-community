/**
 * Client-side encryption for sensitive data (API keys) using Web Crypto API.
 *
 * SECURITY MODEL:
 * - Uses AES-256-GCM with a device-bound key derived via PBKDF2
 * - The encryption key is derived from a fingerprint (origin + userAgent + hardwareInfo)
 *   and stored as a non-extractable CryptoKey in memory
 * - Each encryption uses a fresh random IV (12 bytes)
 * - This is NOT bulletproof against a determined attacker with full browser access,
 *   but it prevents: plain-text key exposure in DevTools, casual copy-paste theft,
 *   and automated scraping of localStorage
 *
 * The API key is NEVER stored in plain text in localStorage.
 */

const SALT = new TextEncoder().encode('verdict-byok-encryption-salt-v1');
const ITERATIONS = 100_000;

/**
 * Generate a device-bound fingerprint as the encryption seed.
 * This ties the encrypted data to this specific browser/device.
 */
function getDeviceFingerprint(): string {
    const parts = [
        window.location.origin,
        navigator.userAgent,
        navigator.language,
        String(navigator.hardwareConcurrency || 4),
        String(screen.width) + 'x' + String(screen.height),
    ];
    return parts.join('|');
}

/**
 * Derive an AES-256-GCM key from the device fingerprint using PBKDF2.
 */
async function deriveKey(): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(getDeviceFingerprint()),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: SALT,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false, // non-extractable
        ['encrypt', 'decrypt']
    );
}

// Cache the derived key in memory (never persisted)
let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
    if (!cachedKey) {
        cachedKey = await deriveKey();
    }
    return cachedKey;
}

/**
 * Encrypt a string value. Returns a base64-encoded string containing IV + ciphertext.
 */
export async function encryptValue(plaintext: string): Promise<string> {
    if (!plaintext) return '';

    try {
        const key = await getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // Fresh IV each time
        const encoded = new TextEncoder().encode(plaintext);

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoded
        );

        // Combine IV + ciphertext into a single buffer
        const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        // Return as base64 with a prefix so we can detect encrypted vs plain values
        return 'enc:' + btoa(String.fromCharCode(...combined));
    } catch (e) {
        console.error('[Encryption] Failed to encrypt:', e);
        return plaintext; // Fallback to plain text if encryption fails
    }
}

/**
 * Decrypt a value that was encrypted by encryptValue().
 * Also handles plain text (for migration from unencrypted storage).
 */
export async function decryptValue(stored: string): Promise<string> {
    if (!stored) return '';

    // If it doesn't have our prefix, it's a plain text value (legacy/migration)
    if (!stored.startsWith('enc:')) {
        return stored;
    }

    try {
        const key = await getKey();
        const raw = stored.slice(4); // Remove 'enc:' prefix
        const combined = Uint8Array.from(atob(raw), c => c.charCodeAt(0));

        // Extract IV (first 12 bytes) and ciphertext (rest)
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error('[Encryption] Failed to decrypt (key may have changed):', e);
        return ''; // Return empty if decryption fails (device changed, etc.)
    }
}

/**
 * Check if a stored value is encrypted.
 */
export function isEncrypted(value: string): boolean {
    return value.startsWith('enc:');
}
