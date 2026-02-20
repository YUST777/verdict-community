export function mapLanguageToExtension(lang: string): string {
    const map: Record<string, string> = {
        'cpp': 'cpp20',
        'python': 'python3',
        'javascript': 'node',
        'csharp': 'csharp',
        'java': 'java',
        'kotlin': 'kotlin',
        'go': 'go',
        'rust': 'rust'
    };
    return map[lang] || lang;
}

export function getSubmitUrl(contestId: string, problemId: string, urlType: string, groupId?: string): string {
    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

    if (urlType === 'gym') {
        return `https://codeforces.com/gym/${safeContestId}/submit?problemIndex=${safeProblemId}`;
    } else if (urlType === 'group' && groupId) {
        return `https://codeforces.com/group/${groupId}/contest/${safeContestId}/submit?problemIndex=${safeProblemId}`;
    }
    return `https://codeforces.com/contest/${safeContestId}/submit?problemIndex=${safeProblemId}`;
}

export function mapVerdict(v: string | null): string {
    if (!v) return 'In queue';
    const map: Record<string, string> = {
        'OK': 'Accepted',
        'WRONG_ANSWER': 'Wrong Answer',
        'TIME_LIMIT_EXCEEDED': 'Time Limit Exceeded',
        'MEMORY_LIMIT_EXCEEDED': 'Memory Limit Exceeded',
        'RUNTIME_ERROR': 'Runtime Error',
        'COMPILATION_ERROR': 'Compilation Error',
        'TESTING': 'Testing',
        'CHALLENGED': 'Challenged',
        'SKIPPED': 'Skipped',
        'PARTIAL': 'Partial'
    };
    return map[v] || v;
}

export function getNavigationBaseUrl(contestId: string, urlType: string, groupId?: string): string {
    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;

    switch (urlType) {
        case 'gym':
            return `/gym/${safeContestId}/problem`;
        case 'problemset':
            return `/problemset/problem/${safeContestId}`;
        case 'group':
            if (groupId) {
                return `/group/${groupId}/contest/${safeContestId}/problem`;
            }
            return '';
        case 'acmsguru':
            return `/problemsets/acmsguru/problem/99999`;
        default:
            return `/contest/${safeContestId}/problem`;
    }
}

