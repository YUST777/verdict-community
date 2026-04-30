import { useState, useEffect, useCallback } from 'react';

export type Scope = 'national' | 'university';

/**
 * Shared scope state — persists in sessionStorage so it stays
 * consistent as you navigate between pages.
 */
export function useScope() {
    const [scope, setScope] = useState<Scope>('national');

    useEffect(() => {
        const saved = sessionStorage.getItem('verdict-scope');
        if (saved === 'university' || saved === 'national') setScope(saved);
    }, []);

    const changeScope = useCallback((s: Scope) => {
        setScope(s);
        sessionStorage.setItem('verdict-scope', s);
    }, []);

    return { scope, setScope: changeScope };
}
