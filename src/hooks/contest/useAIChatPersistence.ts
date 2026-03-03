'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useAIChatPersistence — Hybrid cloud persistence for AI chat.
 *
 * PRIMARY source of truth: normalized `ai_conversations` + `ai_messages` tables
 * (loaded via GET /api/ai/chat/history, saved via POST /api/ai/chat/history).
 *
 * SECONDARY backup: the JSONB blob in `user_workspaces` (debounced 2s via POST /api/workspace/sync).
 * This acts as a fallback if the normalized tables are empty (e.g. existing users
 * who already have JSONB data from before the migration).
 *
 * On mount:
 *   1. Try normalized API → if data exists, use it.
 *   2. Else, try workspace JSONB → if data exists, use it AND migrate to normalized.
 *   3. Else, start fresh.
 *
 * On message send:
 *   - Fire-and-forget POST to /api/ai/chat/history (individual message, normalized).
 *     POST now uses UPSERT on client_id, so re-saving the same message updates it.
 *   - Debounced POST to /api/workspace/sync (full JSONB blob, backup).
 */
export function useAIChatPersistence(
    problemId: string,
    isAuthenticated: boolean = false,
    initialTabs: any[] = [{ id: 'default', label: 'Chat 1' }],
    onAuthError?: () => void
) {
    const [messagesByTab, setMessagesByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [conceptsByTab, setConceptsByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [inputByTab, setInputByTab] = useState<Record<string, string>>({ 'default': '' });
    const [chatTabs, setChatTabs] = useState<any[]>(initialTabs);
    const [isLoaded, setIsLoaded] = useState(false);

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

    // ── Load on mount ────────────────────────────────────────────────
    useEffect(() => {
        if (!problemId) return;

        let isMounted = true;

        const loadData = async () => {
            if (!isAuthenticated) {
                if (isMounted) setIsLoaded(true);
                return;
            }

            try {
                // === Step 1: Try normalized tables ===
                const histRes = await fetch(`/api/ai/chat/history?problemId=${problemId}`);

                if (histRes.ok) {
                    const histData = await histRes.json();

                    // If we have tabs with messages from normalized tables, use them
                    if (histData.tabs?.length > 0) {
                        const hasAnyMessages = Object.values(histData.messagesByTab || {}).some(
                            (msgs: any) => Array.isArray(msgs) && msgs.length > 0
                        );

                        if (hasAnyMessages && isMounted) {
                            setChatTabs(histData.tabs);
                            // Hydrate timestamps
                            const hydrated: Record<string, any[]> = {};
                            for (const tabId in histData.messagesByTab) {
                                hydrated[tabId] = (histData.messagesByTab[tabId] || []).map((m: any) => ({
                                    ...m,
                                    timestamp: new Date(m.timestamp)
                                }));
                            }
                            setMessagesByTab(hydrated);

                            // Load concepts from normalized tables
                            if (histData.conceptsByTab) {
                                setConceptsByTab(prev => ({
                                    ...prev,
                                    ...histData.conceptsByTab
                                }));
                            }

                            setIsLoaded(true);
                            return; // Successfully loaded from normalized tables
                        }
                    }
                } else if (histRes.status === 401) {
                    console.warn('[AIChat] 401 from normalized history, falling back');
                }

                // === Step 2: Fallback to workspace JSONB ===
                const wsRes = await fetch(`/api/workspace/sync?problemId=${problemId}`);

                if (wsRes.ok) {
                    const wsData = await wsRes.json();
                    if (wsData.data && isMounted) {
                        const data = wsData.data;
                        if (data.ai_chat_tabs) {
                            setChatTabs(data.ai_chat_tabs);
                        }
                        if (data.ai_chat_messages) {
                            const hydratedRecord: Record<string, any[]> = {};
                            for (const tabId in data.ai_chat_messages) {
                                hydratedRecord[tabId] = (data.ai_chat_messages[tabId] || []).map((m: any) => ({
                                    ...m,
                                    timestamp: new Date(m.timestamp)
                                }));
                            }
                            setMessagesByTab(hydratedRecord);

                            // === Migrate JSONB data to normalized tables (fire-and-forget) ===
                            const tabs = data.ai_chat_tabs || initialTabs;
                            migrateJsonbToNormalized(problemId, tabs, hydratedRecord);
                        }
                        if (data.ai_chat_concepts) {
                            setConceptsByTab(data.ai_chat_concepts);
                        }
                        if (data.ai_chat_inputs) {
                            setInputByTab(data.ai_chat_inputs);
                        }
                        setIsLoaded(true);
                        return;
                    }
                } else if (wsRes.status === 401) {
                    console.warn('[AIChat] 401 from workspace sync');
                }
            } catch (err: any) {
                console.error('[AIChat] Load error:', err?.message || err);
            }

            // === Step 3: Nothing found, start fresh ===
            if (isMounted) setIsLoaded(true);
        };

        loadData();

        return () => {
            isMounted = false;
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [problemId, isAuthenticated]);

    // ── Debounced JSONB backup save ──────────────────────────────────
    useEffect(() => {
        if (!isLoaded || !problemId) return;
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }
        if (!isAuthenticated) return;

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
                    console.warn(`[AIChat Backup] Save failed (${response.status}):`, body || 'empty');
                }
            } catch (err: any) {
                console.error('[AIChat Backup] Save exception:', err?.message || err);
            }
        }, 2000); // 2s debounce for backup

    }, [messagesByTab, chatTabs, conceptsByTab, inputByTab, problemId, isLoaded, isAuthenticated]);

    // ── saveMessage: persist a single message to normalized tables ───
    // Now uses UPSERT on client_id — safe to call multiple times for same message.
    const saveMessage = useCallback((
        tabId: string,
        tabLabel: string,
        message: {
            id: string;
            role: string;
            content: string;
            contextType?: string;
            codeBlock?: any;
            sources?: any[];
            videoScript?: any;
        }
    ) => {
        if (!isAuthenticated || !problemId) return;

        // Fire-and-forget — don't block UI
        fetch('/api/ai/chat/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problemId,
                tabId,
                tabLabel,
                message: {
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    contextType: message.contextType || 'chat',
                    ...(message.codeBlock ? { codeBlock: message.codeBlock } : {}),
                    ...(message.sources ? { sources: message.sources } : {}),
                    ...(message.videoScript ? { videoScript: message.videoScript } : {}),
                }
            })
        }).catch(err => {
            console.warn('[AIChat] Failed to persist message:', err?.message || err);
        });
    }, [isAuthenticated, problemId]);

    // ── saveConcepts: persist concepts to conversation metadata ──────
    const saveConcepts = useCallback((tabId: string, concepts: any[]) => {
        if (!isAuthenticated || !problemId || !concepts || concepts.length === 0) return;

        fetch('/api/ai/chat/history', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problemId,
                tabId,
                metadata: { concepts }
            })
        }).catch(err => {
            console.warn('[AIChat] Failed to persist concepts:', err?.message || err);
        });
    }, [isAuthenticated, problemId]);

    // ── deleteConversation: remove a tab from normalized tables ──────
    const deleteConversation = useCallback((tabId: string) => {
        if (!isAuthenticated || !problemId) return;

        fetch('/api/ai/chat/history', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ problemId, tabId })
        }).catch(err => {
            console.warn('[AIChat] Failed to delete conversation:', err?.message || err);
        });
    }, [isAuthenticated, problemId]);

    return {
        messagesByTab,
        setMessagesByTab,
        conceptsByTab,
        setConceptsByTab,
        inputByTab,
        setInputByTab,
        chatTabs,
        setChatTabs,
        isLoaded,
        saveMessage,
        saveConcepts,
        deleteConversation
    };
}

/**
 * One-time migration: takes JSONB blob data and writes each message
 * into the normalized tables. Fire-and-forget.
 */
function migrateJsonbToNormalized(
    problemId: string,
    tabs: { id: string; label: string }[],
    messagesByTab: Record<string, any[]>
) {
    for (const tab of tabs) {
        const msgs = messagesByTab[tab.id] || [];
        for (const msg of msgs) {
            if (!msg.content && !msg.sources) continue; // skip empty

            fetch('/api/ai/chat/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId,
                    tabId: tab.id,
                    tabLabel: tab.label,
                    message: {
                        id: msg.id || `migrated-${Date.now()}-${Math.random()}`,
                        role: msg.role || 'user',
                        content: msg.content || '',
                        contextType: 'chat',
                        ...(msg.codeBlock ? { codeBlock: msg.codeBlock } : {}),
                        ...(msg.sources ? { sources: msg.sources } : {}),
                        ...(msg.videoScript ? { videoScript: msg.videoScript } : {}),
                    }
                })
            }).catch(() => { /* fire and forget */ });
        }
    }
}
