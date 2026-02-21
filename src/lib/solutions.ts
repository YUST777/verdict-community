/**
 * Fetches accepted Codeforces solutions via the Wayback Machine.
 * Optimized for Production: 4-Tier Discovery Engine
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Legendary authors whose solutions are most likely to be archived
const ELITE_AUTHORS = [
    'tourist', 'Benq', 'mnbvmar', 'ecnerwala', 'radewoosh', 'ksun48',
    'um_nik', 'Petr', 'neal', 'maroonrk', 'jiangly', 'scott_wu', 'eat_apple',
    '300iq', 'Egor', 'V_O_V_A', 'W4utiful', 'Tle'
];

interface CFSubmission {
    id: number;
    verdict: string;
    programmingLanguage: string;
    problem: { contestId: number; index: string };
    author: { members: { handle: string }[] };
}

interface Solution {
    code: string;
    language: string;
    author: string;
}

const solutionCache = new Map<string, Solution | null>();

/**
 * Tier 0: Simple utility to normalize languages
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
 * Core Helper: Verify and fetch code from a wayback snapshot
 */
async function verifyAndFetch(
    timestamp: string,
    originalUrl: string,
    contestId: number,
    problemIndex: string,
    preferredLang?: string
): Promise<Solution | null> {
    const waybackUrl = `https://web.archive.org/web/${timestamp}/${originalUrl}`;
    try {
        const pageRes = await fetch(waybackUrl, {
            headers: { 'User-Agent': UA },
            signal: AbortSignal.timeout(5000)
        });
        if (!pageRes.ok) return null;

        const html = await pageRes.text();
        const problemRegex = new RegExp(`/contest/${contestId}/problem/${problemIndex}`, 'i');
        const isAccepted = html.includes('verdict-accepted') || html.includes('OK') || html.includes('Accepted');

        if (problemRegex.test(html) && isAccepted) {
            const match = html.match(/id="program-source-text"[^>]*>([\s\S]*?)<\/pre>/);
            if (match) {
                const authorMatch = html.match(/\/profile\/([^"]+)"/);
                const langMatch = html.match(/<td>\s*Language:\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>/i);

                let code = match[1]
                    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
                    .replace(/&#10;/g, '\n').replace(/&#13;/g, '\r');

                if (code.length > 5000) {
                    code = code.substring(0, 5000) + '\n// ...[TRUNCATED for context window]';
                }

                return {
                    code,
                    language: langMatch ? normalizeLang(langMatch[1]) : (preferredLang || 'cpp'),
                    author: authorMatch ? authorMatch[1] : 'unknown'
                };
            }
        }
    } catch (e) {
        // Silent fail for individual verification nodes
    }
    return null;
}

/**
 * Main Entry Point: 4-Tier Production Discovery Engine
 */
export async function fetchAcceptedSolution(
    contestId: number,
    problemIndex: string,
    preferredLang?: string
): Promise<Solution | null> {
    const cacheKey = `${contestId}-${problemIndex}-${preferredLang || 'any'}`;
    if (solutionCache.has(cacheKey)) return solutionCache.get(cacheKey) || null;

    console.log(`[DiscoveryEngine] Targeted fetch for ${contestId}${problemIndex}...`);

    try {
        // Tier 1: Instant Availability Check for Elite Players (The "Legendary 20")
        // Since elite players often have their submissions archived immediately, 
        // we can find a high-quality solution without even checking the CF status API.
        const tier1Potential = await fetchEliteSolutions(contestId, problemIndex, preferredLang);
        if (tier1Potential) {
            solutionCache.set(cacheKey, tier1Potential);
            return tier1Potential;
        }

        // Tier 2: Status API prioritized fetch
        const submissions = await getSubmissionsForProblem(contestId, problemIndex);
        if (submissions.length > 0) {
            const tier2Potential = await findArchivedParallel(contestId, submissions, problemIndex, preferredLang);
            if (tier2Potential) {
                solutionCache.set(cacheKey, tier2Potential);
                return tier2Potential;
            }
        }

        // Tier 3: Broad CDX contest search
        const tier3Potential = await broadCDXSearch(contestId, problemIndex, preferredLang);
        if (tier3Potential) {
            solutionCache.set(cacheKey, tier3Potential);
            return tier3Potential;
        }

        solutionCache.set(cacheKey, null);
        return null;
    } catch (err) {
        console.error('[DiscoveryEngine] Critcal Failure:', err);
        return null;
    }
}

/**
 * Tier 1 Helper: Fast availability check for top players
 */
async function fetchEliteSolutions(contestId: number, problemIndex: string, preferredLang?: string): Promise<Solution | null> {
    // We first check the status API for these players specifically to get their submission IDs
    // Top players usually have < 100 submissions in a contest, so this is 1 fast API call.
    const eliteCandidates = ELITE_AUTHORS.slice(0, 6); // Top 6 is enough for Tier 1

    const results = await Promise.all(eliteCandidates.map(async handle => {
        try {
            const res = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.status !== 'OK') return null;
            const sub = data.result.find((s: CFSubmission) =>
                s.problem.index.toUpperCase() === problemIndex.toUpperCase() && s.verdict === 'OK'
            );
            if (!sub) return null;

            // Immediately check availability
            const availRes = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(`codeforces.com/contest/${contestId}/submission/${sub.id}`)}`);
            if (availRes.ok) {
                const availData = await availRes.json();
                const snap = availData?.archived_snapshots?.closest;
                if (snap?.available) {
                    return verifyAndFetch(snap.timestamp, snap.url, contestId, problemIndex, preferredLang);
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }));

    return results.find(r => r !== null) || null;
}

/**
 * Tier 2 Helper: Get submissions from general status
 */
async function getSubmissionsForProblem(contestId: number, problemIndex: string): Promise<number[]> {
    try {
        const res = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&from=1&count=2000`);
        if (!res.ok) return [];
        const data = await res.json();
        if (data.status !== 'OK') return [];
        return data.result
            .filter((s: CFSubmission) => s.problem.index.toUpperCase() === problemIndex.toUpperCase() && s.verdict === 'OK')
            .map((s: CFSubmission) => s.id)
            .slice(0, 20); // Top 20 candidates only for parallel check
    } catch (e) {
        return [];
    }
}

/**
 * Tier 2 Helper: Ping archives in parallel
 */
async function findArchivedParallel(contestId: number, ids: number[], problemIndex: string, preferredLang?: string): Promise<Solution | null> {
    const promises = ids.map(async id => {
        try {
            const url = `codeforces.com/contest/${contestId}/submission/${id}`;
            const resp = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
            if (!resp.ok) return null;
            const data = await resp.json();
            const snap = data?.archived_snapshots?.closest;
            if (snap?.available) {
                return verifyAndFetch(snap.timestamp, snap.url, contestId, problemIndex, preferredLang);
            }
        } catch (e) { /* ignore */ }
        return null;
    });

    const results = await Promise.all(promises);
    return results.find(r => r !== null) || null;
}

/**
 * Tier 3 Helper: Broad CDX search fallback
 */
async function broadCDXSearch(contestId: number, problemIndex: string, preferredLang?: string): Promise<Solution | null> {
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=codeforces.com/contest/${contestId}/submission/*&output=json&limit=500&filter=statuscode:200`;
    try {
        const res = await fetch(cdxUrl);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || data.length <= 1) return null;

        const rows = data.slice(1).sort((a: string[], b: string[]) => {
            const idA = parseInt(a[2].match(/\/submission\/(\d+)/)?.[1] || '0');
            const idB = parseInt(b[2].match(/\/submission\/(\d+)/)?.[1] || '0');
            return idB - idA;
        });

        // We check top 15 from CDX
        for (const row of rows.slice(0, 15)) {
            const [, timestamp, originalUrl] = row;
            const result = await verifyAndFetch(timestamp, originalUrl, contestId, problemIndex, preferredLang);
            if (result) return result;
        }
    } catch (e) { /* ignore */ }
    return null;
}
