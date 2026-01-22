import { useState, useEffect } from 'react';

const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(0); cin.tie(0);
    
    return 0;
}
`;

interface UseCodePersistenceParams {
    contestId: string;
    problemId: string;
}

interface UseCodePersistenceReturn {
    code: string;
    setCode: (code: string) => void;
    language: string;
    setLanguage: (lang: string) => void;
}

export function useCodePersistence({ contestId, problemId }: UseCodePersistenceParams): UseCodePersistenceReturn {
    const [code, setCode] = useState(DEFAULT_CODE);
    const [language, setLanguage] = useState('cpp');

    // Load saved code and language
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const storageKey = `verdict-code-${safeContestId}-${safeProblemId}`;
        const langKey = `verdict-lang-${safeContestId}-${safeProblemId}`;

        const savedCode = localStorage.getItem(storageKey);
        const savedLang = localStorage.getItem(langKey);

        if (savedCode) {
            setTimeout(() => setCode(savedCode), 0);
        }
        if (savedLang) {
            setTimeout(() => setLanguage(savedLang), 0);
        }
    }, [contestId, problemId]);

    // Save code to localStorage
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const storageKey = `verdict-code-${safeContestId}-${safeProblemId}`;
        localStorage.setItem(storageKey, code);
    }, [code, contestId, problemId]);

    // Save language to localStorage
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const langKey = `verdict-lang-${safeContestId}-${safeProblemId}`;
        localStorage.setItem(langKey, language);
    }, [language, contestId, problemId]);

    return { code, setCode, language, setLanguage };
}

