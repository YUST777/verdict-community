'use client';

import { useState, useEffect, useRef } from 'react';

// We reuse the basic shape of messages and tabs from AIAgentPanel
export function useAIChatPersistence(problemId: string, isAuthenticated: boolean = false, initialTabs: any[] = [{ id: 'default', label: 'Chat 1' }], onAuthError?: () => void) {
    const [messagesByTab, setMessagesByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [conceptsByTab, setConceptsByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [inputByTab, setInputByTab] = useState<Record<string, string>>({ 'default': '' });
    const [chatTabs, setChatTabs] = useState<any[]>(initialTabs);
    const [isLoaded, setIsLoaded] = useState(false);

    // We use refs to avoid triggering effect cycles and track latest values for debouncing
    const messagesRef = useRef(messagesByTab);
    const conceptsRef = useRef(conceptsByTab);
    const inputRef = useRef(inputByTab);
    const tabsRef = useRef(chatTabs);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstLoad = useRef(true);

    // Sync refs
    useEffect(() => {
        messagesRef.current = messagesByTab;
        conceptsRef.current = conceptsByTab;
        inputRef.current = inputByTab;
        tabsRef.current = chatTabs;
    }, [messagesByTab, conceptsByTab, inputByTab, chatTabs]);

    // Initial load from cloud (fallback to local storage for guest mode)
    useEffect(() => {
        if (!problemId) return;

        let isMounted = true;

        const loadData = async () => {
            try {
                // 1. Try to load from Supabase ONLY if authenticated
                if (isAuthenticated) {
                    const response = await fetch(`/api/workspace/sync?problemId=${problemId}`);
                    if (response.ok) {
                        const json = await response.json();
                        if (json.data) {
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
                                if (json.data.ai_chat_concepts) {
                                    setConceptsByTab(json.data.ai_chat_concepts);
                                }
                                if (json.data.ai_chat_inputs) {
                                    setInputByTab(json.data.ai_chat_inputs);
                                }
                                setIsLoaded(true);
                                return; // Successfully loaded from cloud
                            }
                        }
                    } else if (response.status === 401) {
                        // Session might have expired but Main Auth context hasn't reacted yet
                        // We don't trigger onAuthError here to avoid loops during mount, 
                        // we just let it fall back to local storage.
                        console.warn('[AIChat Sync] 401 during initial load, falling back to local');
                    }
                }
            } catch (err: any) {
                console.error('[AIChat Sync] Load error:', err?.message || err);
            }

            // 2. Default fallback for unauthenticated or first-time cloud users
            if (isMounted) {
                setIsLoaded(true);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [problemId, isAuthenticated]);

    // Save changes to cloud (debounced)
    useEffect(() => {
        if (!isLoaded || !problemId) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        // Skip cloud sync if not authenticated
        if (!isAuthenticated) return;

        // Debounced Cloud Save
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                const body = {
                    problemId,
                    aiChatMessages: messagesByTab,
                    aiChatTabs: chatTabs,
                    aiChatConcepts: conceptsByTab,
                    aiChatInput: inputByTab
                };

                const response = await fetch('/api/workspace/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (response.status === 401) {
                    onAuthError?.();
                } else if (!response.ok) {
                    const body = await response.text().catch(() => '');
                    console.warn(`[AIChat Sync] Save failed (${response.status}):`, body || 'empty response');
                }
            } catch (err: any) {
                console.error('[AIChat Sync] Save exception:', err?.message || err);
            }
        }, 1500); // 1.5s debounce to batch character streams optimally

    }, [messagesByTab, chatTabs, conceptsByTab, inputByTab, problemId, isLoaded, isAuthenticated]);

    return {
        messagesByTab,
        setMessagesByTab,
        conceptsByTab,
        setConceptsByTab,
        inputByTab,
        setInputByTab,
        chatTabs,
        setChatTabs,
        isLoaded
    };
}
