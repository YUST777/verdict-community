import { useState, useEffect, useRef } from 'react';

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
    const [isLoaded, setIsLoaded] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

    const dbProblemId = `${safeContestId}-${safeProblemId}`;
    const storageKeyCode = `verdict-code-${safeContestId}-${safeProblemId}`;
    const storageKeyLang = `verdict-lang-${safeContestId}-${safeProblemId}`;

    // Load saved code and language
    useEffect(() => {
        if (!contestId || !problemId) return;

        async function loadData() {
            const localCode = localStorage.getItem(storageKeyCode);
            const localLang = localStorage.getItem(storageKeyLang);

            try {
                const res = await fetch(`/api/workspace/sync?problemId=${encodeURIComponent(dbProblemId)}`);
                if (res.ok) {
                    const { data } = await res.json();
                    if (data) {
                        if (data.saved_code) setCode(data.saved_code);
                        else if (localCode) setCode(localCode);

                        if (data.selected_language) setLanguage(data.selected_language);
                        else if (localLang) setLanguage(localLang);
                    } else {
                        if (localCode) setCode(localCode);
                        if (localLang) setLanguage(localLang);
                    }
                } else {
                    if (localCode) setCode(localCode);
                    if (localLang) setLanguage(localLang);
                }
            } catch (err) {
                console.error('[workspace/sync] Failed to load DB workspace', err);
                if (localCode) setCode(localCode);
                if (localLang) setLanguage(localLang);
            }
            setIsLoaded(true);
        }

        loadData();
    }, [contestId, problemId, dbProblemId, storageKeyCode, storageKeyLang]);

    // Save changes to localStorage & Debounced upsert to Supabase
    useEffect(() => {
        if (!isLoaded) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (!contestId || !problemId) return;

        // Save to local storage immediately for fast local reloads regardless
        localStorage.setItem(storageKeyCode, code);
        localStorage.setItem(storageKeyLang, language);

        // Debounce DB upsert
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch('/api/workspace/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: dbProblemId,
                        savedCode: code,
                        selectedLanguage: language
                    })
                });
            } catch (err) {
                console.error('[workspace/sync] Failed to sync code to db', err);
            }
        }, 1000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [code, language, contestId, problemId, dbProblemId, isLoaded, storageKeyCode, storageKeyLang]);

    return { code, setCode, language, setLanguage };
}
