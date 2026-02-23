'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LocalToCloudSync() {
    const supabase = createClient();
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        let mounted = true;

        async function performSync() {
            if (hasSyncedRef.current) return;
            const syncedFlag = localStorage.getItem('verdict_synced_to_cloud');
            if (syncedFlag === 'true') {
                hasSyncedRef.current = true;
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return; // Not logged in yet

            hasSyncedRef.current = true; // Prevent duplicate runs

            // Gather all workspaces data from localStorage
            const workspaces: Record<string, any> = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key) continue;

                if (key.startsWith('verdict-code-')) {
                    const parts = key.replace('verdict-code-', '').split('-');
                    if (parts.length >= 2) {
                        const problemId = parts.join('-');
                        if (!workspaces[problemId]) workspaces[problemId] = {};
                        workspaces[problemId].savedCode = localStorage.getItem(key);
                    }
                } else if (key.startsWith('verdict-lang-')) {
                    const parts = key.replace('verdict-lang-', '').split('-');
                    if (parts.length >= 2) {
                        const problemId = parts.join('-');
                        if (!workspaces[problemId]) workspaces[problemId] = {};
                        workspaces[problemId].selectedLanguage = localStorage.getItem(key);
                    }
                } else if (key.startsWith('verdict-custom-tests-')) {
                    const parts = key.replace('verdict-custom-tests-', '').split('-');
                    if (parts.length >= 2) {
                        const problemId = parts.join('-');
                        if (!workspaces[problemId]) workspaces[problemId] = {};
                        try {
                            const val = localStorage.getItem(key);
                            if (val) workspaces[problemId].customTestCases = JSON.parse(val);
                        } catch (e) { }
                    }
                } else if (key.startsWith('whiteboard-') && key.endsWith('-primary')) {
                    const parts = key.replace('whiteboard-', '').replace('-primary', '').split('-');
                    if (parts.length >= 2) {
                        const problemId = parts.join('-');
                        if (!workspaces[problemId]) workspaces[problemId] = {};
                        try {
                            const val = localStorage.getItem(key);
                            if (val) workspaces[problemId].whiteboardData = JSON.parse(val);
                        } catch (e) { }
                    }
                } else if (key.startsWith('verdict_ai_chat_')) {
                    const problemId = key.replace('verdict_ai_chat_', '');
                    if (!workspaces[problemId]) workspaces[problemId] = {};
                    try {
                        const val = localStorage.getItem(key);
                        if (val) workspaces[problemId].aiChatMessages = JSON.parse(val);
                    } catch (e) { }
                } else if (key.startsWith('verdict_ai_tabs_')) {
                    const problemId = key.replace('verdict_ai_tabs_', '');
                    if (!workspaces[problemId]) workspaces[problemId] = {};
                    try {
                        const val = localStorage.getItem(key);
                        if (val) workspaces[problemId].aiChatTabs = JSON.parse(val);
                    } catch (e) { }
                }
            }

            const problemIds = Object.keys(workspaces);
            if (problemIds.length === 0) {
                // Nothing to sync
                localStorage.setItem('verdict_synced_to_cloud', 'true');
                return;
            }

            try {
                // Sync each accumulated workspace sequentially to avoid overwhelming DB immediately
                for (const problemId of problemIds) {
                    const payload = {
                        problemId,
                        ...workspaces[problemId]
                    };

                    await fetch('/api/workspace/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                // Clear anonymous local storage drafts based on instructions
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.startsWith('verdict-code-') ||
                        key.startsWith('verdict-lang-') ||
                        key.startsWith('verdict-custom-tests-') ||
                        (key.startsWith('whiteboard-') && key.endsWith('-primary')) ||
                        (key.startsWith('whiteboard-') && !key.includes('-primary') && key.length > 11) || // legacy format
                        key.startsWith('verdict_ai_chat_') ||
                        key.startsWith('verdict_ai_tabs_')
                    )) {
                        localStorage.removeItem(key);
                    }
                }

                localStorage.setItem('verdict_synced_to_cloud', 'true');

                // Force a reload so the hooks cleanly pull from DB immediately after clearance
                if (mounted) {
                    window.location.reload();
                }

            } catch (e) {
                console.error('Failed to sync local data to cloud', e);
                hasSyncedRef.current = false; // Allow retry
            }
        }

        performSync();

        // Listen to auth state changes to trigger sync right upon login
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                performSync();
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('verdict_synced_to_cloud');
                hasSyncedRef.current = false;
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    return null; // Silent component
}
