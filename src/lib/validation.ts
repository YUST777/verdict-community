import { z } from 'zod';

// ─── Zod Schemas ────────────────────────────────────────────────────

export const emailSchema = z.string()
    .email('Invalid email address')
    .min(5, 'Email too short')
    .max(255, 'Email too long')
    .toLowerCase();

export const passwordSchema = z.string()
    .min(9, 'Password must be at least 9 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .max(100, 'Password too long');

export const nationalIdSchema = z.string()
    .length(14, 'National ID must be exactly 14 characters')
    .regex(/^\d+$/, 'National ID must contain only digits');

export const studentIdSchema = z.string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID too long');

export const telephoneSchema = z.string()
    .regex(/^\+20\d{10}$/, 'Invalid phone number format (+20...)');

export const codeforcesHandleSchema = z.string()
    .min(3, 'Codeforces handle too short')
    .max(24, 'Codeforces handle too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid Codeforces handle format')
    .optional();

export const otpSchema = z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits');

// Egyptian university email validation (.edu.eg domain)
export const universityEmailSchema = z.string()
    .email('Invalid email address')
    .refine(
        (email) => email.toLowerCase().endsWith('.edu.eg'),
        'Email must be a valid Egyptian university email (.edu.eg)'
    );

// ─── Registration Schemas ───────────────────────────────────────────

export const step1Schema = z.object({
    email: universityEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const step2Schema = z.object({
    email: emailSchema,
    code: otpSchema,
});

export const step3Schema = z.object({
    name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
    telephone: telephoneSchema,
    faculty: z.string().min(1, 'Faculty is required'),
    studentId: studentIdSchema,
    nationalId: nationalIdSchema.optional(),
    studentLevel: z.string().min(1, 'Level is required'),
    codeforcesProfile: codeforcesHandleSchema,
    leetcodeProfile: z.string().max(100).optional(),
});

export const fullRegistrationSchema = z.object({
    email: universityEmailSchema,
    password: passwordSchema,
    name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
    telephone: telephoneSchema,
    faculty: z.string().min(1, 'Faculty is required'),
    studentId: studentIdSchema,
    nationalId: nationalIdSchema.optional(),
    studentLevel: z.string().min(1, 'Level is required'),
    codeforcesProfile: codeforcesHandleSchema,
    leetcodeProfile: z.string().max(100).optional(),
});

// ─── Sanitization Functions ─────────────────────────────────────────

export const sanitizeInput = (str: unknown): string => {
    if (typeof str !== 'string') return '';

    // Remove any potentially dangerous characters
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/['";\\]/g, '') // Remove SQL injection characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
        .substring(0, 500); // Limit length to prevent DoS
};

/**
 * Validate that a request body is not too large.
 * @param contentLength The content-length header value
 * @param maxBytes Maximum allowed body size in bytes (default: 1MB)
 * @returns true if within limits, false if too large
 */
export const validateBodySize = (contentLength: string | null, maxBytes: number = 1_048_576): boolean => {
    if (!contentLength) return true; // Let the parser handle missing content-length
    const size = parseInt(contentLength, 10);
    if (isNaN(size)) return true;
    return size <= maxBytes;
};

export const escapeHtml = (unsafe: unknown): string => {
    if (typeof unsafe !== 'string') return '';

    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;');
};

export const extractUsername = (url: string | null | undefined, platform: 'leetcode' | 'codeforces'): string | null => {
    if (!url || !url.trim()) return null;
    const input = url.trim();

    // If input doesn't contain slashes or dots, assume it's a username
    if (!input.includes('/') && !input.includes('.') && !input.includes(' ')) {
        return input;
    }

    try {
        // If it doesn't start with http, prepend it to try parsing as URL
        const urlToParse = input.startsWith('http') ? input : `https://${input}`;
        const urlObj = new URL(urlToParse);

        if (platform === 'leetcode') {
            const leetcodeRegex = /leetcode\.com\/(?:u\/)?([^\/]+)\/?$/i;
            const match = urlToParse.match(leetcodeRegex);
            if (match && match[1]) return match[1];

            if (urlToParse.includes('leetcode.com')) {
                const parts = urlObj.pathname.split('/').filter(p => p && p !== 'u');
                return parts[parts.length - 1] || null;
            }
        } else if (platform === 'codeforces') {
            const cfRegex = /codeforces\.com\/(?:profile\/|submissions\/|people\/)?([^\/]+)\/?$/i;
            const match = urlToParse.match(cfRegex);
            if (match && match[1]) return match[1];

            if (urlToParse.includes('codeforces.com')) {
                const parts = urlObj.pathname.split('/').filter(p => p && !['profile', 'submissions', 'people', 'contest'].includes(p));
                return parts[parts.length - 1] || null;
            }
        }
    } catch {
        return null;
    }
    return null;
};

// ─── University Email Utilities ─────────────────────────────────────

/**
 * Extract university domain from an email address
 * e.g., "student@eng.cu.edu.eg" -> "cu.edu.eg" (Cairo University)
 */
export const extractUniversityDomain = (email: string): string | null => {
    const match = email.toLowerCase().match(/@(.+\.edu\.eg)$/);
    if (!match) return null;
    
    const domain = match[1];
    // Extract main university domain (skip subdomain like eng., sci., etc.)
    const parts = domain.split('.');
    if (parts.length >= 3) {
        // Return last 3 parts: university.edu.eg
        return parts.slice(-3).join('.');
    }
    return domain;
};

/**
 * Validate MX records exist for the email domain
 * This prevents fake university emails
 */
export const validateEmailDomainExists = async (email: string): Promise<boolean> => {
    try {
        const dns = await import('dns').then(m => m.promises);
        const domain = email.split('@')[1];
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch {
        return false;
    }
};
