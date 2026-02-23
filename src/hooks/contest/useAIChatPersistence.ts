'use client';

import { useState, useEffect, useRef } from 'react';

// We reuse the basic shape of messages and tabs from AIAgentPanel
export function useAIChatPersistence(problemId: string, initialTabs: any[] = [{ id: 'default', label: 'Chat 1' }]) {
    const [messagesByTab, setMessagesByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [chatTabs, setChatTabs] = useState<any[]>(initialTabs);
    const [isLoaded, setIsLoaded] = useState(false);

    // We use refs to avoid triggering effect cycles and track latest values for debouncing
    const messagesRef = useRef(messagesByTab);
    const tabsRef = useRef(chatTabs);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    // Sync refs
    useEffect(() => {
        messagesRef.current = messagesByTab;
        tabsRef.current = chatTabs;
    }, [messagesByTab, chatTabs]);

    // Initial load from cloud (fallback to local storage for guest mode)
    useEffect(() => {
        if (!problemId) return;

        let isMounted = true;

        const loadData = async () => {
            try {
                // 1. Try to load from Supabase
                const response = await fetch(`/api/workspace/sync?problemId=${problemId}`);
                if (response.ok) {
                    const json = await response.json();
                    if (json.data && (json.data.ai_chat_messages || json.data.ai_chat_tabs)) {
                        if (isMounted) {
                            if (json.data.ai_chat_tabs) {
                                setChatTabs(json.data.ai_chat_tabs);
                            }
                            if (json.data.ai_chat_messages) {
                                // Hydrate dates manually
                                const parsedMsgs = json.data.ai_chat_messages;
                                const hydratedRecord: Record<string, any[]> = {};
                                for (const tabId in parsedMsgs) {
                                    hydratedRecord[tabId] = (parsedMsgs[tabId] || []).map((m: any) => ({
                                        ...m,
                                        timestamp: new Date(m.timestamp)
                                    }));
                                }
                                setMessagesByTab(hydratedRecord);
                            }
                            setIsLoaded(true);
                            return; // Successfully loaded from cloud
                        }
                    }
                }
            } catch (err) {
                console.error('[AIChat Sync] Load error:', err);
            }

            // 2. Fallback to local storage (unauthenticated or cloud failed)
            if (isMounted) {
                try {
                    const tabsKey = `verdict_ai_tabs_${problemId}`;
                    const tabsStored = localStorage.getItem(tabsKey);
                    if (tabsStored) {
                        const parsedTabs = JSON.parse(tabsStored);
                        if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
                            setChatTabs(parsedTabs);
                        }
                    }

                    const key = `verdict_ai_chat_${problemId}`;
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            // Legacy Array Format (shouldnt be reached if tabs are used, but strictly supporting it)
                            const hydratedMessages = parsed.map((m: any) => ({
                                ...m,
                                timestamp: new Date(m.timestamp)
                            }));
                            setMessagesByTab({ 'default': hydratedMessages });
                        } else {
                            const hydratedRecord: Record<string, any[]> = {};
                            for (const tabId in parsed) {
                                hydratedRecord[tabId] = (parsed[tabId] || []).map((m: any) => ({
                                    ...m,
                                    timestamp: new Date(m.timestamp)
                                }));
                            }
                            setMessagesByTab(hydratedRecord);
                        }
                    }
                } catch (e) {
                    console.error('[AI Chat] Failed to load local fallback:', e);
                }

                setIsLoaded(true);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [problemId]);

    // Save changes to cloud (debounced) and local storage (immediate)
    useEffect(() => {
        if (!isLoaded || !problemId) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        // Immediate Local Storage save (for guests and smooth transitions)
        localStorage.setItem(`verdict_ai_chat_${problemId}`, JSON.stringify(messagesByTab));
        localStorage.setItem(`verdict_ai_tabs_${problemId}`, JSON.stringify(chatTabs));

        // Debounced Cloud Save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch('/api/workspace/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId,
                        aiChatMessages: messagesRef.current,
                        aiChatTabs: tabsRef.current
                    })
                });

                if (!res.ok && res.status !== 401) { // 401 just means they are not logged in, which is fine to ignore
                    console.error('[AIChat Sync] Save failed:', await res.text());
                }
            } catch (err) {
                console.error('[AIChat Sync] Save exception:', err);
            }
        }, 1500); // 1.5s debounce to batch character streams optimally

    }, [messagesByTab, chatTabs, problemId, isLoaded]);

    return {
        messagesByTab,
        setMessagesByTab,
        chatTabs,
        setChatTabs,
        isLoaded
    };
}
