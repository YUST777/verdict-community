/**
 * Fetches accepted Codeforces solutions via the Wayback Machine.
 * Super Discovery Engine: Massive Parallel Search & Tiered Verification
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Legendary authors with extremely high archival probability
const ELITE_AUTHORS = [
    'tourist', 'Benq', 'mnbvmar', 'ecnerwala', 'radewoosh', 'ksun48',
    'um_nik', 'Petr', 'neal', 'maroonrk', 'jiangly', 'scott_wu', 'eat_apple',
    '300iq', 'Egor', 'V_O_V_A', 'W4utiful', 'Tle', 'Reyna', 'molamola.', 'yosupo',
    'koosaga', 'a_p_p_l_e', 'LGM', 'scottwu'
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
 * Normalizes language strings
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
 * Robustly verifies if an archived page is the correct accepted solution
 */
async function verifySolutionPage(
    timestamp: string,
    originalUrl: string,
    contestId: number,
    problemIndex: string
): Promise<Solution | null> {
    const waybackUrl = `https://web.archive.org/web/${timestamp}/${originalUrl}`;
    try {
        const res = await fetch(waybackUrl, {
            headers: { 'User-Agent': UA },
            signal: AbortSignal.timeout(30000) // 30s timeout for sluggish Wayback Machine
        });
        if (!res.ok) return null;

        const html = await res.text();

        // Multi-pattern verification: Be extremely liberal
        const patterns = [
            new RegExp(`/contest/${contestId}/problem/${problemIndex}`, 'i'),
            new RegExp(`/problemset/problem/${contestId}/${problemIndex}`, 'i'),
            new RegExp(`>${problemIndex}\\s*-\\s*`, 'i'),
            new RegExp(`${contestId}${problemIndex}`, 'i'),
            new RegExp(`>\\s*${problemIndex}\\s*<`, 'i')
        ];

        const isAccepted = html.includes('verdict-accepted') || html.includes('OK') || html.includes('Accepted') || html.includes('Correct');
        const matchesProblem = patterns.some(p => p.test(html)) || (html.includes(`${contestId}`) && html.includes(`${problemIndex}`));

        if (matchesProblem && isAccepted) {
            const sourceMatch = html.match(/id="program-source-text"[^>]*>([\s\S]*?)<\/pre>/);
            if (sourceMatch && sourceMatch[1].trim().length > 20) {
                const authorMatch = html.match(/\/profile\/([^"]+)"/);
                const langMatch = html.match(/<td>\s*Language:\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>/i);

                let code = sourceMatch[1]
                    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
                    .replace(/&#10;/g, '\n').replace(/&#13;/g, '\r');

                if (code.length > 5000) code = code.substring(0, 5000) + '\n// ...[TRUNCATED]';

                return {
                    code,
                    language: langMatch ? normalizeLang(langMatch[1]) : 'cpp',
                    author: authorMatch ? authorMatch[1] : 'unknown'
                };
            }
        }
    } catch (e) { /* silent skip */ }
    return null;
}

/**
 * Super Discovery Engine
 */
export async function fetchAcceptedSolution(
    contestId: number,
    problemIndex: string,
    preferredLang?: string
): Promise<Solution | null> {
    const cacheKey = `${contestId}-${problemIndex}-${preferredLang || 'any'}`;
    if (solutionCache.has(cacheKey)) return solutionCache.get(cacheKey) || null;

    console.log(`[SuperEngine] SEARCHING: Contest ${contestId}, Problem ${problemIndex}`);

    try {
        // --- PHASE 1: MASSIVE ELITE PARALLEL SWEEP (The legendary "Top 20") ---
        // We ping the status of 25 world-class players in parallel.
        const eliteMatch = await fetchEliteSolutions(contestId, problemIndex, preferredLang);
        if (eliteMatch) {
            solutionCache.set(cacheKey, eliteMatch);
            return eliteMatch;
        }

        // --- PHASE 2: DEEP STATUS HARVEST (5000+ entries) ---
        const deepCandidates = await runDeepStatusSweep(contestId, problemIndex);
        if (deepCandidates.length > 0) {
            const match = await checkAvailabilityInParallel(contestId, deepCandidates, problemIndex);
            if (match) {
                solutionCache.set(cacheKey, match);
                return match;
            }
        }

        // --- PHASE 3: BROAD ARCHIVE BACKFILL (CDX Crawl) ---
        const cdxMatch = await runCDXBackfill(contestId, problemIndex);
        if (cdxMatch) {
            solutionCache.set(cacheKey, cdxMatch);
            return cdxMatch;
        }

        solutionCache.set(cacheKey, null);
        return null;
    } catch (err) {
        console.error('[SuperEngine] Search Aborted:', err);
        return null;
    }
}

async function fetchEliteSolutions(contestId: number, problemIndex: string, preferredLang?: string): Promise<Solution | null> {
    // We check the status API for these players specifically
    const eliteCandidates = ELITE_AUTHORS.slice(0, 15); // Check top 15 legendary authors

    console.log(`[SuperEngine] Tier 1: Checking elite handles...`);

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

            console.log(`[SuperEngine] Tier 1 candidate found: ${sub.id} by ${handle}`);
            const availRes = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(`codeforces.com/contest/${contestId}/submission/${sub.id}`)}`);
            if (availRes.ok) {
                const availData = await availRes.json();
                const snap = availData?.archived_snapshots?.closest;
                if (snap?.available) {
                    console.log(`[SuperEngine] Candidate ${sub.id} is available in Wayback!`);
                    return verifySolutionPage(snap.timestamp, snap.url, contestId, problemIndex);
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }));

    return results.find(r => r !== null) || null;
}

async function runEliteSweep(contestId: number, problemIndex: string): Promise<number[]> {
    const ids: number[] = [];
    const seen = new Set<number>();

    // Parallel fetch personal status for all 25 elite authors
    const statusPromises = ELITE_AUTHORS.map(async handle => {
        try {
            const res = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`);
            if (!res.ok) return [];
            const data = await res.json();
            if (data.status !== 'OK') return [];
            return data.result
                .filter((s: CFSubmission) => s.problem.index.toUpperCase() === problemIndex.toUpperCase() && s.verdict === 'OK')
                .map((s: CFSubmission) => s.id);
        } catch (e) { return []; }
    });

    const results = await Promise.all(statusPromises);
    for (const list of results) {
        for (const id of list) {
            if (!seen.has(id)) { ids.push(id); seen.add(id); }
        }
    }
    return ids;
}

async function runDeepStatusSweep(contestId: number, problemIndex: string): Promise<number[]> {
    const ids: number[] = [];
    // Fetch up to 5000 entries (2 calls of 2500)
    const offsets = [1, 2501];
    const fetchPromises = offsets.map(async from => {
        try {
            const res = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestId}&from=${from}&count=2500`);
            if (!res.ok) return [];
            const data = await res.json();
            if (data.status !== 'OK') return [];
            return data.result
                .filter((s: CFSubmission) => s.problem.index.toUpperCase() === problemIndex.toUpperCase() && s.verdict === 'OK')
                .map((s: CFSubmission) => s.id);
        } catch (e) { return []; }
    });

    const results = await Promise.all(fetchPromises);
    for (const list of results) ids.push(...list);
    return ids.slice(0, 50); // Top 50 unique status candidates
}

async function checkAvailabilityInParallel(contestId: number, ids: number[], problemIndex: string): Promise<Solution | null> {
    // Ping Wayback Availability for candidates in parallel batches of 10
    for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        const batchPromises = batch.map(async id => {
            try {
                const url = `codeforces.com/contest/${contestId}/submission/${id}`;
                const resp = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`);
                if (!resp.ok) return null;
                const data = await resp.json();
                const snap = data?.archived_snapshots?.closest;
                if (snap?.available) {
                    return verifySolutionPage(snap.timestamp, snap.url, contestId, problemIndex);
                }
            } catch (e) { /* ignore */ }
            return null;
        });
        const results = await Promise.all(batchPromises);
        const find = results.find(r => r !== null);
        if (find) return find;
    }
    return null;
}

async function runCDXBackfill(contestId: number, problemIndex: string): Promise<Solution | null> {
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=codeforces.com/contest/${contestId}/submission/*&output=json&limit=1000&filter=statuscode:200`;
    try {
        const res = await fetch(cdxUrl);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || data.length <= 1) return null;

        const rows = data.slice(1);
        // We want to check a mixture of old and new.
        // Reverse ID order (recent) and Original order (old)
        const recentRows = [...rows].sort((a: string[], b: string[]) => {
            const idA = parseInt(a[2].match(/\/submission\/(\d+)/)?.[1] || '0');
            const idB = parseInt(b[2].match(/\/submission\/(\d+)/)?.[1] || '0');
            return idB - idA;
        });

        const candidates = [
            ...recentRows.slice(0, 20),
            ...rows.slice(0, 20) // Original order (likely older)
        ];

        for (let i = 0; i < candidates.length; i += 5) {
            const batch = candidates.slice(i, i + 5);
            const results = await Promise.all(batch.map(async row => {
                return verifySolutionPage(row[1], row[2], contestId, problemIndex);
            }));
            const find = results.find(r => r !== null);
            if (find) return find;
        }
    } catch (e) { /* ignore */ }
    return null;
}
