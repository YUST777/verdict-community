import { useEffect, useRef, useCallback } from 'react';

/**
 * Comprehensive behavior tracking for cheating detection & analytics.
 * Ported from ICPCHUE — tracks tab switches, paste events, idle time,
 * devtools, copy, keystrokes, heartbeat, scroll depth, and more.
 */
export function useBehaviorTracking({
    track,
    contestId,
    problemId,
    sheetId,
}: {
    track: (payload: any) => void;
    contestId: string;
    problemId: string;
    sheetId?: string;
}) {
    const enterTimeRef = useRef(Date.now());
    const lastActivityRef = useRef(Date.now());
    const keystrokeCountRef = useRef(0);
    const pasteCountRef = useRef(0);
    const tabSwitchCountRef = useRef(0);
    const codeChangeCountRef = useRef(0);
    const maxScrollDepthRef = useRef(0);

    const ctx = useCallback(() => ({ contestId, problemId, sheetId }), [contestId, problemId, sheetId]);

    // Reset on problem change
    useEffect(() => {
        enterTimeRef.current = Date.now();
        lastActivityRef.current = Date.now();
        keystrokeCountRef.current = 0;
        pasteCountRef.current = 0;
        tabSwitchCountRef.current = 0;
        codeChangeCountRef.current = 0;
        maxScrollDepthRef.current = 0;
    }, [contestId, problemId]);

    // Tab visibility
    useEffect(() => {
        const handler = () => {
            tabSwitchCountRef.current++;
            track({ action: document.hidden ? 'tab_hidden' : 'tab_visible', ...ctx(), metadata: { switchCount: tabSwitchCountRef.current, timeOnProblemMs: Date.now() - enterTimeRef.current } });
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, [track, ctx]);

    // Window focus/blur
    useEffect(() => {
        const onBlur = () => track({ action: 'window_blur', ...ctx(), metadata: { timeMs: Date.now() - enterTimeRef.current } });
        const onFocus = () => { track({ action: 'window_focus', ...ctx(), metadata: { timeMs: Date.now() - enterTimeRef.current } }); lastActivityRef.current = Date.now(); };
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        return () => { window.removeEventListener('blur', onBlur); window.removeEventListener('focus', onFocus); };
    }, [track, ctx]);

    // Paste detection
    useEffect(() => {
        const handler = (e: ClipboardEvent) => {
            const text = e.clipboardData?.getData('text') || '';
            pasteCountRef.current++;
            track({
                action: 'code_paste', ...ctx(),
                metadata: { len: text.length, lines: text.split('\n').length, totalPastes: pasteCountRef.current, timeMs: Date.now() - enterTimeRef.current, hasCode: /\b(for|while|if|return|function|class|def|int|void|#include|import)\b/.test(text) },
            });
        };
        document.addEventListener('paste', handler);
        return () => document.removeEventListener('paste', handler);
    }, [track, ctx]);

    // Copy detection
    useEffect(() => {
        const handler = () => {
            const sel = window.getSelection()?.toString() || '';
            track({ action: 'text_copy', ...ctx(), metadata: { len: sel.length, timeMs: Date.now() - enterTimeRef.current } });
        };
        document.addEventListener('copy', handler);
        return () => document.removeEventListener('copy', handler);
    }, [track, ctx]);

    // Keystroke counting
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
                keystrokeCountRef.current++;
                lastActivityRef.current = Date.now();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Idle detection (>60s)
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.hidden) return;
            const idleMs = Date.now() - lastActivityRef.current;
            if (idleMs > 60000) {
                track({ action: 'user_idle', ...ctx(), metadata: { idleMs, timeMs: Date.now() - enterTimeRef.current } });
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [track, ctx]);

    // Heartbeat every 60s
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.hidden) return;
            track({
                action: 'heartbeat', ...ctx(),
                metadata: { timeMs: Date.now() - enterTimeRef.current, keystrokes: keystrokeCountRef.current, pastes: pasteCountRef.current, tabSwitches: tabSwitchCountRef.current, codeChanges: codeChangeCountRef.current, scrollDepth: maxScrollDepthRef.current },
            });
        }, 60000);
        return () => clearInterval(timer);
    }, [track, ctx]);

    // Problem leave (unmount) — sendBeacon
    useEffect(() => {
        return () => {
            const payload = JSON.stringify({
                action: 'problem_leave', contestId, problemId, sheetId,
                sessionId: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('verdict-session-id') || '' : '',
                metadata: { totalTimeMs: Date.now() - enterTimeRef.current, keystrokes: keystrokeCountRef.current, pastes: pasteCountRef.current, tabSwitches: tabSwitchCountRef.current, codeChanges: codeChangeCountRef.current, scrollDepth: maxScrollDepthRef.current },
            });
            try { navigator.sendBeacon('/api/track', payload); } catch {
                fetch('/api/track', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
            }
        };
    }, [contestId, problemId, sheetId]);

    // Context menu
    useEffect(() => {
        const handler = () => track({ action: 'context_menu', ...ctx(), metadata: { timeMs: Date.now() - enterTimeRef.current } });
        document.addEventListener('contextmenu', handler);
        return () => document.removeEventListener('contextmenu', handler);
    }, [track, ctx]);

    // DevTools detection
    useEffect(() => {
        let lastWidth = window.outerWidth;
        let lastHeight = window.outerHeight;
        const handler = () => {
            const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
            const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
            if (widthDiff > 200 || heightDiff > 200) {
                track({ action: 'devtools_open', ...ctx(), metadata: { widthDiff, heightDiff, timeMs: Date.now() - enterTimeRef.current } });
            }
            const wChange = Math.abs(window.outerWidth - lastWidth);
            const hChange = Math.abs(window.outerHeight - lastHeight);
            if (wChange > 100 || hChange > 100) {
                track({ action: 'resize_window', ...ctx(), metadata: { w: window.innerWidth, h: window.innerHeight, timeMs: Date.now() - enterTimeRef.current } });
            }
            lastWidth = window.outerWidth;
            lastHeight = window.outerHeight;
        };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [track, ctx]);

    // Print attempt (Ctrl+P)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                track({ action: 'print_attempt', ...ctx(), metadata: { timeMs: Date.now() - enterTimeRef.current } });
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [track, ctx]);

    // Code change frequency
    useEffect(() => {
        const handler = () => { codeChangeCountRef.current++; lastActivityRef.current = Date.now(); };
        window.addEventListener('verdict:code-change', handler);
        return () => window.removeEventListener('verdict:code-change', handler);
    }, []);
}
