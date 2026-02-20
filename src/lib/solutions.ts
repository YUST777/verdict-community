/**
 * Fetches accepted Codeforces solutions via the Wayback Machine.
 * Pipeline: CF API → Wayback CDX → Wayback Web → Source Code
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Simple in-memory cache to avoid repeated lookups
const solutionCache = new Map<string, { code: string; language: string; author: string } | null>();

interface CFSubmission {
    id: number;
    verdict: string;
    programmingLanguage: string;
    problem: { contestId: number; index: string };
    author: { members: { handle: string }[] };
}

/**
 * Normalize CF language strings to match our language dropdown
 */
function normalizeLang(cfLang: string): string {
    const l = cfLang.toLowerCase();
    if (l.includes('c++') || l.includes('gnu c++') || l.includes('gcc')) return 'cpp';
    if (l.includes('python') || l.includes('pypy')) return 'python';
    if (l.includes('java')) return 'java';
    if (l.includes('c#') || l.includes('mono') || l.includes('.net')) return 'csharp';
    if (l.includes('kotlin')) return 'kotlin';
    if (l.includes('go ') || l.includes('golang')) return 'go';
    if (l.includes('rust')) return 'rust';
    if (l.includes('javascript') || l.includes('node')) return 'javascript';
    return 'unknown';
}

/**
 * Step 1: Get accepted submission IDs from Codeforces API
 */
async function getAcceptedSubmissions(
    contestId: number,
    problemIndex: string,
    preferredLang?: string
): Promise<{ id: number; language: string; author: string }[]> {
    const url = `https://codeforces.com/api/contest.status?contestId=${contestId}&from=1&count=2000`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CF API error: ${res.status}`);

    const data = await res.json();
    if (data.status !== 'OK') throw new Error(`CF API: ${data.comment || 'Unknown error'}`);

    const accepted: CFSubmission[] = data.result.filter(
        (s: CFSubmission) => s.problem.index === problemIndex && s.verdict === 'OK'
    );

    // Sort: preferred language first, then C++ (most common), then others
    const sorted = accepted.sort((a, b) => {
        const aLang = normalizeLang(a.programmingLanguage);
        const bLang = normalizeLang(b.programmingLanguage);
        if (preferredLang) {
            if (aLang === preferredLang && bLang !== preferredLang) return -1;
            if (bLang === preferredLang && aLang !== preferredLang) return 1;
        }
        if (aLang === 'cpp' && bLang !== 'cpp') return -1;
        if (bLang === 'cpp' && aLang !== 'cpp') return 1;
        return 0;
    });

    return sorted.slice(0, 50).map(s => ({
        id: s.id,
        language: normalizeLang(s.programmingLanguage),
        author: s.author.members?.[0]?.handle || 'unknown'
    }));
}

/**
 * Step 2: Find which submission URLs are archived in the Wayback Machine
 */
async function findArchivedSubmissions(
    contestId: number,
    submissionIds: number[]
): Promise<{ submissionId: number; timestamp: string; url: string }[]> {
    // Query the CDX API for any archived submissions for this contest
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=codeforces.com/contest/${contestId}/submission/*&output=json&limit=200&filter=statuscode:200`;
    const res = await fetch(cdxUrl);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data || data.length <= 1) return [];

    // data[0] is headers, data[1..] are results
    const rows = data.slice(1);
    const results: { submissionId: number; timestamp: string; url: string }[] = [];

    const idSet = new Set(submissionIds.map(String));

    for (const row of rows) {
        const [, timestamp, originalUrl] = row;
        // Extract submission ID from the URL
        const match = originalUrl.match(/\/submission\/(\d+)/);
        if (match && idSet.has(match[1])) {
            results.push({
                submissionId: parseInt(match[1], 10),
                timestamp,
                url: originalUrl
            });
        }
    }

    return results;
}

/**
 * Step 3: Fetch source code from a Wayback Machine archived page
 */
async function fetchCodeFromWayback(
    timestamp: string,
    originalUrl: string
): Promise<string | null> {
    const waybackUrl = `https://web.archive.org/web/${timestamp}/${originalUrl}`;
    const res = await fetch(waybackUrl, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' }
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract source code from the #program-source-text element
    const match = html.match(/id="program-source-text"[^>]*>([\s\S]*?)<\/pre>/);
    if (!match) return null;

    // Decode HTML entities
    let code = match[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#10;/g, '\n')
        .replace(/&#13;/g, '\r');

    // Truncate to prevent context window blowout
    if (code.length > 3000) {
        code = code.substring(0, 3000) + '\n// ...[TRUNCATED]';
    }

    return code;
}

/**
 * Main entry point: Fetch an accepted solution for a given CF problem.
 */
export async function fetchAcceptedSolution(
    contestId: number,
    problemIndex: string,
    preferredLang?: string
): Promise<{ code: string; language: string; author: string } | null> {
    const cacheKey = `${contestId}-${problemIndex}-${preferredLang || 'any'}`;

    if (solutionCache.has(cacheKey)) {
        return solutionCache.get(cacheKey) || null;
    }

    try {
        // Step 1: Get accepted submission IDs
        const submissions = await getAcceptedSubmissions(contestId, problemIndex, preferredLang);
        if (submissions.length === 0) {
            solutionCache.set(cacheKey, null);
            return null;
        }

        // Step 2: Check which are archived
        const archived = await findArchivedSubmissions(
            contestId,
            submissions.map(s => s.id)
        );

        if (archived.length > 0) {
            // Step 3: Fetch source code from the first archived match
            for (const arch of archived) {
                const sub = submissions.find(s => s.id === arch.submissionId);
                const code = await fetchCodeFromWayback(arch.timestamp, arch.url);
                if (code && code.trim().length > 10) {
                    const result = {
                        code,
                        language: sub?.language || 'cpp',
                        author: sub?.author || 'unknown'
                    };
                    solutionCache.set(cacheKey, result);
                    return result;
                }
            }
        }

        // No archived submission found for this specific problem
        // Do NOT fallback to random contest submissions — they may be for different problems

        solutionCache.set(cacheKey, null);
        return null;
    } catch (error: any) {
        console.error('Solution fetch error:', error.message);
        solutionCache.set(cacheKey, null);
        return null;
    }
}
