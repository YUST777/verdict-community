/**
 * Robustly extracts and parses JSON from a string that might contain 
 * other content (like markdown, reasoning tags, etc.)
 */
export function extractAndParseJson<T = any>(text: string): T {
    if (!text) throw new Error('Empty input for JSON parsing');

    // 1. Remove common wrapping artifacts
    let clean = text.trim();

    // Remove markdown code blocks
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');

    // Remove <think> tags or other similar tags if they surround the content
    clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // 2. Find the outermost balanced braces
    let firstBrace = clean.indexOf('{');
    let lastBrace = clean.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
        throw new Error('No valid JSON object found in response');
    }

    const candidate = clean.substring(firstBrace, lastBrace + 1);

    try {
        // Attempt 1: Standard JSON parse
        return JSON.parse(candidate);
    } catch (err) {
        // Attempt 2: More aggressive cleaning
        try {
            const aggressiveClean = candidate
                .replace(/,\s*([\]}])/g, '$1') // Remove trailing commas
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove non-printable chars

            return JSON.parse(aggressiveClean);
        } catch (err2) {
            console.error('[JSON Utils] Failed to parse extracted candidate:', candidate);
            throw new Error('Failed to parse AI response. The JSON structure was malformed.');
        }
    }
}
