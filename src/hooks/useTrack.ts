import { useCallback, useRef, useEffect, useMemo } from 'react';

interface TrackPayload {
    action: string;
    contestId?: string;
    problemId?: string;
    sheetId?: string;
    metadata?: Record<string, unknown>;
}

const lastSent = new Map<string, number>();
const DEBOUNCE_MS = 2000;
const MAX_DEBOUNCE_ENTRIES = 200;

if (typeof window !== 'undefined') {
    setInterval(() => {
        if (lastSent.size <= MAX_DEBOUNCE_ENTRIES) return;
        const now = Date.now();
        for (const [key, ts] of lastSent) {
            if (now - ts > 30000) lastSent.delete(key);
        }
    }, 60000);
}

function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sid = sessionStorage.getItem('verdict-session-id');
    if (!sid) {
        sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('verdict-session-id', sid);
    }
    return sid;
}

export function useTrack() {
    const queueRef = useRef<TrackPayload[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sessionId = useMemo(() => getSessionId(), []);

    const flush = useCallback(() => {
        const batch = queueRef.current.splice(0);
        if (batch.length === 0) return;
        for (const payload of batch) {
            fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, sessionId }),
                keepalive: true,
            }).catch(() => {});
        }
    }, [sessionId]);

    const track = useCallback((payload: TrackPayload) => {
        const key = `${payload.action}:${payload.contestId || ''}:${payload.problemId || ''}`;
        const now = Date.now();
        const last = lastSent.get(key);
        if (last && now - last < DEBOUNCE_MS) return;
        lastSent.set(key, now);
        queueRef.current.push(payload);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(flush, 500);
    }, [flush]);

    useEffect(() => {
        const handleUnload = () => flush();
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [flush]);

    return track;
}
