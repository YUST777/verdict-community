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

    // 2. Extract candidate starting from the first brace
    const firstBrace = clean.indexOf('{');
    if (firstBrace === -1) {
        throw new Error('No valid JSON object found in response');
    }

    // We take everything from the first brace. 
    // The state machine below will naturally stop or repair as needed.
    const candidate = clean.substring(firstBrace);

    const tryParse = (str: string) => {
        try {
            return JSON.parse(str);
        } catch (err) {
            // Attempt 2: More aggressive cleaning
            try {
                let processed = str
                    .replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas

                // Fix common invalid escapes like \theta, \alpha, etc.
                processed = processed.replace(/\\(?![nr"\\tbfu]|u[0-9a-fA-F]{4})/g, '\\\\');

                // Convert literal tabs to \t since JSON doesn't allow raw tabs in strings
                processed = processed.replace(/\t/g, '\\t');

                // Remove non-printable characters except whitespace
                processed = processed.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

                return JSON.parse(processed);
            } catch (err2) {
                // Attempt 3: Use state machine to escape newlines ONLY inside JSON strings
                try {
                    const fixed = escapeNewlinesInJsonStrings(str);
                    return JSON.parse(fixed);
                } catch (err3) {
                    return null;
                }
            }
        }
    };

    let result = tryParse(candidate);
    if (result) return result;

    // 3. TRUNCATION REPAIR: If normal parsing fails, the JSON might be truncated
    console.warn('[JSON Utils] Standard parsing failed, attempting truncation repair...');

    let repaired = candidate.trim();

    // Use a simple state machine to track nesting and string state
    let inString = false;
    let isEscaped = false;
    const stack: string[] = [];

    for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (char === '\\') {
            isEscaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') stack.push('}');
            else if (char === '[') stack.push(']');
            else if (char === '}' || char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === char) {
                    stack.pop();
                }
            }
        }
    }

    // Close unclosed string
    if (inString) {
        if (isEscaped) {
            repaired = repaired.slice(0, -1);
        }
        repaired += '"';
    }

    // Close unclosed objects/arrays
    while (stack.length > 0) {
        repaired += stack.pop();
    }

    result = tryParse(repaired);
    if (result) {
        console.log('[JSON Utils] Truncation repair successful');
        return result;
    }

    console.error('[JSON Utils] Failed to parse extracted candidate:', candidate);
    throw new Error('Failed to parse AI response. The JSON structure was malformed.');
}

/**
 * State-machine that walks the JSON string character by character
 * and escapes raw newlines/carriage-returns ONLY when they appear
 * inside a quoted string value. Structural whitespace between keys
 * is left untouched.
 */
function escapeNewlinesInJsonStrings(input: string): string {
    const out: string[] = [];
    let inStr = false;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];

        if (escaped) {
            out.push(ch);
            escaped = false;
            continue;
        }

        if (ch === '\\' && inStr) {
            out.push(ch);
            escaped = true;
            continue;
        }

        if (ch === '"') {
            inStr = !inStr;
            out.push(ch);
            continue;
        }

        if (inStr) {
            if (ch === '\n') {
                out.push('\\n');
                continue;
            }
            if (ch === '\r') {
                out.push('\\r');
                continue;
            }
            if (ch === '\t') {
                out.push('\\t');
                continue;
            }
        }

        out.push(ch);
    }

    return out.join('');
}
