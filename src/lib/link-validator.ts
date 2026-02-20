
/**
 * Link Validator Utility
 * Ensures 100% valid links by checking HTTP status before serving.
 */

interface ValidationResult {
    isValid: boolean;
    url: string;
    statusCode?: number;
    error?: string;
}

/**
 * Validates a URL by making a HEAD request.
 * @param url The URL to validate
 * @param timeoutMs Timeout in milliseconds (default 3000ms)
 */
export async function validateLink(url: string, timeoutMs: number = 3000): Promise<ValidationResult> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Verdict-AI-Agent/1.0' // Polite User Agent
            }
        });

        clearTimeout(id);

        return {
            isValid: response.ok, // True if status is 200-299
            url,
            statusCode: response.status
        };

    } catch (error: any) {
        clearTimeout(id);

        // Handle specific errors
        if (error.name === 'AbortError') {
            return { isValid: false, url, error: 'Timeout' };
        }

        return {
            isValid: false,
            url,
            error: error.message
        };
    }
}

/**
 * filters a list of links, returning only valid ones.
 * Run in parallel for speed.
 */
export async function getVerifiedLinks(links: string[]): Promise<string[]> {
    const validationPromises = links.map(link => validateLink(link));
    const results = await Promise.all(validationPromises);

    return results
        .filter(r => r.isValid)
        .map(r => r.url);
}
