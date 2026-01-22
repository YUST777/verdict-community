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
