export interface ParsedCodeforcesUrl {
    type: 'contest' | 'gym' | 'problemset' | 'group' | 'acmsguru';
    contestId: string;
    problemId: string;
    groupId?: string;
    isSheet: boolean;
}

export function parseCodeforcesUrl(url: string): ParsedCodeforcesUrl | null {
    if (!url) return null;
    const cleanUrl = url.split('?')[0].split('#')[0];

    const groupProblem = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (groupProblem) return { type: 'group', groupId: groupProblem[1], contestId: groupProblem[2], problemId: groupProblem[3].toUpperCase(), isSheet: false };

    const contestProblem = cleanUrl.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (contestProblem) return { type: 'contest', contestId: contestProblem[1], problemId: contestProblem[2].toUpperCase(), isSheet: false };

    const gymProblem = cleanUrl.match(/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
    if (gymProblem) return { type: 'gym', contestId: gymProblem[1], problemId: gymProblem[2].toUpperCase(), isSheet: false };

    const problemset = cleanUrl.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
    if (problemset) return { type: 'problemset', contestId: problemset[1], problemId: problemset[2].toUpperCase(), isSheet: false };

    const acmsguru = cleanUrl.match(/problemsets\/acmsguru\/problem\/99999\/(\d+)/i);
    if (acmsguru) return { type: 'acmsguru', contestId: '99999', problemId: acmsguru[1], isSheet: false };

    const groupGeneric = cleanUrl.match(/group\/([A-Za-z0-9]+)\/contest\/(\d+)/i);
    if (groupGeneric) return { type: 'group', groupId: groupGeneric[1], contestId: groupGeneric[2], problemId: 'A', isSheet: true };

    const contestGeneric = cleanUrl.match(/contest\/(\d+)/i);
    if (contestGeneric) return { type: 'contest', contestId: contestGeneric[1], problemId: 'A', isSheet: true };

    const gymGeneric = cleanUrl.match(/gym\/(\d+)/i);
    if (gymGeneric) return { type: 'gym', contestId: gymGeneric[1], problemId: 'A', isSheet: true };

    return null;
}

/** Get the internal route for a parsed CF URL */
export function getInternalRoute(parsed: ParsedCodeforcesUrl): string {
    if (parsed.type === 'group' && parsed.groupId) {
        return `/group/${parsed.groupId}/contest/${parsed.contestId}/problem/${parsed.problemId}`;
    } else if (parsed.type === 'gym') {
        return `/gym/${parsed.contestId}/problem/${parsed.problemId}`;
    } else if (parsed.type === 'problemset') {
        return `/problemset/problem/${parsed.contestId}/${parsed.problemId}`;
    } else if (parsed.type === 'acmsguru') {
        return `/problemsets/acmsguru/problem/99999/${parsed.problemId}`;
    }
    return `/contest/${parsed.contestId}/problem/${parsed.problemId}`;
}

/** Difficulty color based on CF rating */
export function getDifficultyColor(rating?: number): { bg: string; text: string; label: string } {
    if (!rating) return { bg: 'bg-white/10', text: 'text-white/50', label: '?' };
    if (rating <= 1200) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Easy' };
    if (rating <= 1600) return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'Easy' };
    if (rating <= 2100) return { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Medium' };
    return { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Hard' };
}

/** CF Rating to numeric difficulty tier (for sorting) */
export function getDifficultyTier(rating?: number): number {
    if (!rating) return 0;
    if (rating <= 1600) return 1; // Easy
    if (rating <= 2100) return 2; // Medium
    return 3; // Hard
}
