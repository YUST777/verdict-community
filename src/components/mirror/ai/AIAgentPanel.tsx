'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, Wand2, Code, Settings, BrainCircuit, Globe, X, Youtube, BookOpen, ExternalLink, PlayCircle, Plus, MessageSquare, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { loadAIPreferences, inferPreferencesFromProfile, AILearningPreferences } from '@/lib/ai-personalization';

import AIPreferencesModal from './AIPreferencesModal';
import SignInModal from '@/components/auth/SignInModal';
import { Message } from '@/types/chat';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAIChatPersistence } from '@/hooks/contest/useAIChatPersistence';

import { useLLM } from '@/lib/useLLM';
import { trackInteraction, analyzeQuestion, loadBehaviorPatterns, inferPreferencesFromBehavior } from '@/lib/ai-behavior-learning';
import ChatMessage from './ChatMessage';
import { useTutorSession } from './useTutorSession';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ui/conversation';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { AIContextUsageProvider, useAIContextUsage } from '@/components/ui/ai-context-usage';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'sources';
    content: string;
    timestamp: Date;
    codeBlock?: {
        code: string;
        language: string;
        lineNumbers?: { start: number; end: number };
        lineReference?: string;
    };
    sources?: { title: string; url: string; description: string; type?: 'web' | 'youtube' }[];
}

interface AIAgentPanelProps {
    onSolveProblem?: () => void;
    isLoading?: boolean;
    selectedCode?: string;
    userCode?: string;
    language?: string;
    problemDescription?: string;
    testCases?: Array<{ input: string; output: string }>;
    onCodeSelected?: (code: string) => void;
    initialQuestion?: string;
    codeforcesRating?: number;
    problemTags?: string[];
    problemDifficulty?: string;
    onSelectionCleared?: () => void;
    selectedLineReference?: string; // e.g., "@ lines 3-4"
    onAiCodeUpdate?: (code: string) => void;
    onSwitchToAiTab?: () => void;
    autoStart?: boolean;
    problemId?: string;
    isActive?: boolean;
}

export default function AIAgentPanel({
    onSolveProblem,
    selectedCode,
    userCode = '',
    language = 'cpp',
    problemDescription,
    testCases = [],
    initialQuestion,
    codeforcesRating,
    problemTags = [],
    problemDifficulty,
    onSelectionCleared,
    selectedLineReference,
    onAiCodeUpdate,
    onSwitchToAiTab,
    autoStart = false,
    problemId,
    isActive = false
}: AIAgentPanelProps) {
    const { messagesByTab, setMessagesByTab, chatTabs, setChatTabs, isLoaded } = useAIChatPersistence(problemId || 'unknown');
    const [inputByTab, setInputByTab] = useState<Record<string, string>>({ 'default': initialQuestion || '' });
    const [conceptsByTab, setConceptsByTab] = useState<Record<string, any[]>>({ 'default': [] });
    const [tutorActiveByTab, setTutorActiveByTab] = useState<Record<string, boolean>>({ 'default': false });
    const [isLoadingByTab, setIsLoadingByTab] = useState<Record<string, boolean>>({ 'default': false });
    const [aiStatusByTab, setAiStatusByTab] = useState<Record<string, string>>({ 'default': 'Thinking...' });
    const [preferences, setPreferences] = useState<Partial<AILearningPreferences>>({});
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const { settings } = useLLM();

    // -- Auth State --
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showSignInModal, setShowSignInModal] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setUser(session?.user ?? null);
                setAuthLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleOAuth = async (provider: 'github' | 'google') => {
        try {
            const returnUrl = window.location.href;
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
                }
            });
        } catch (err) {
            console.error('OAuth failed', err);
        }
    };

    // Chat tabs state is now managed by useAIChatPersistence hook
    const [activeChatTab, setActiveChatTab] = useState('default');

    const messages = messagesByTab[activeChatTab] || [];
    const input = inputByTab[activeChatTab] || '';
    const concepts = conceptsByTab[activeChatTab] || [];
    const isTutorActive = tutorActiveByTab[activeChatTab] || false;
    const isLoadingMessage = isLoadingByTab[activeChatTab] || false;
    const aiStatus = aiStatusByTab[activeChatTab] || 'Thinking...';

    const setMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
        setMessagesByTab(prev => {
            const currentTabId = activeChatTab;
            const prevMsgs = prev[currentTabId] || [];
            const nextMsgs = typeof updater === 'function' ? (updater as (p: Message[]) => Message[])(prevMsgs) : updater;
            return {
                ...prev,
                [currentTabId]: nextMsgs
            };
        });
    }, [activeChatTab]);

    const setInput = useCallback((valOrUpdater: string | ((prev: string) => string)) => {
        setInputByTab(prev => {
            const current = activeChatTab;
            const prevVal = prev[current] || '';
            const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prevVal) : valOrUpdater;
            return { ...prev, [current]: nextVal };
        });
    }, [activeChatTab]);

    const setIsLoadingMessage = useCallback((loading: boolean) => {
        setIsLoadingByTab(prev => ({ ...prev, [activeChatTab]: loading }));
    }, [activeChatTab]);

    const setAiStatus = useCallback((status: string) => {
        setAiStatusByTab(prev => ({ ...prev, [activeChatTab]: status }));
    }, [activeChatTab]);

    const addNewChat = useCallback(() => {
        const newId = `chat-${Date.now()}`;

        // Fix duplicate labels: find highest number in existing "Chat N" labels
        const existingNumbers = chatTabs
            .map(t => {
                const match = t.label.match(/Chat (\d+)/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);
        const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : chatTabs.length + 1;
        const newLabel = `Chat ${nextNum}`;

        setChatTabs(prev => [...prev, { id: newId, label: newLabel }]);
        setActiveChatTab(newId);
        setMessagesByTab(prev => ({ ...prev, [newId]: [] }));
        setInputByTab(prev => ({ ...prev, [newId]: '' }));
        setConceptsByTab(prev => ({ ...prev, [newId]: [] }));
        setTutorActiveByTab(prev => ({ ...prev, [newId]: false }));
        setIsLoadingByTab(prev => ({ ...prev, [newId]: false }));
        setAiStatusByTab(prev => ({ ...prev, [newId]: 'Thinking...' }));
    }, [chatTabs]);

    const deleteChat = useCallback((tabId: string) => {
        setChatTabs(prev => {
            if (prev.length <= 1) {
                // Reset the last tab instead of deleting the whole array
                const newId = `chat-${Date.now()}`;
                setMessagesByTab(p => { const d = { ...p, [newId]: [] }; delete d[tabId]; return d; });
                setInputByTab(p => { const d = { ...p, [newId]: '' }; delete d[tabId]; return d; });
                setConceptsByTab(p => { const d = { ...p, [newId]: [] }; delete d[tabId]; return d; });
                setTutorActiveByTab(p => { const d = { ...p, [newId]: false }; delete d[tabId]; return d; });
                setIsLoadingByTab(p => { const d = { ...p, [newId]: false }; delete d[tabId]; return d; });
                setAiStatusByTab(p => { const d = { ...p, [newId]: 'Thinking...' }; delete d[tabId]; return d; });
                return [{ id: newId, label: 'Chat 1' }];
            }
            const filtered = prev.filter(t => t.id !== tabId);
            if (tabId === activeChatTab) {
                const deletedIndex = prev.findIndex(t => t.id === tabId);
                const newActive = filtered[Math.min(deletedIndex, filtered.length - 1)];
                setActiveChatTab(newActive.id);
            }
            setMessagesByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            setInputByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            setConceptsByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            setTutorActiveByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            setIsLoadingByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            setAiStatusByTab(p => {
                const newDict = { ...p };
                delete newDict[tabId];
                return newDict;
            });
            return filtered;
        });
    }, [activeChatTab]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    // Scroll to bottom when messages change or panel becomes active
    useEffect(() => {
        if (isActive || messages.length > 0) {
            // Use a small timeout to ensure the DOM has updated
            const timer = setTimeout(() => scrollToBottom(isActive ? 'auto' : 'smooth'), 100);
            return () => clearTimeout(timer);
        }
    }, [messages.length, isActive]);

    // Streaming ref for regular chat messages
    const prevInitialQuestion = useRef(initialQuestion);

    // Sync initialQuestion to input when it changes from the parent
    useEffect(() => {
        if (initialQuestion && initialQuestion !== prevInitialQuestion.current) {
            setInput(initialQuestion);
            prevInitialQuestion.current = initialQuestion;
        }
    }, [initialQuestion]);

    // (removed local storage useEffect logic as it is now handled by useAIChatPersistence)

    // Message helpers for hook
    const addMessage = useCallback((msg: { id: string; role: 'assistant'; content: string; timestamp: Date; codeBlock?: { code: string; language: string; lineReference?: string } }) => {
        setMessages(prev => [...prev, msg]);
    }, []);

    const updateMessage = useCallback((id: string, content: string) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, content } : m));

        // Note: We don't update DB for message edits since they're typically just status updates
        // The final message content is already saved via addMessage
    }, []);

    // Tutor hook
    const { isLoading: tutorLoading, startTutor, stopTutor, variants, selectedLevel, changeLevel } = useTutorSession({
        problemId,
        language,
        problemDescription,
        testCases,
        getHeaders: () => ({}),
        onAiCodeUpdate,
        onSwitchToAiTab,
        addMessage,
        updateMessage,
        setConcepts: (updater) => {
            setConceptsByTab(prev => {
                const currentTab = activeChatTab;
                const prevVal = prev[currentTab] || [];
                const nextVal = typeof updater === 'function' ? updater(prevVal) : updater;
                return { ...prev, [currentTab]: nextVal };
            });
        },
        setIsTutorActive: (active) => {
            setTutorActiveByTab(prev => ({ ...prev, [activeChatTab]: active }));
        }
    });

    // Tutor Usage Tracking (Once per problem per language)
    const [hasUsedTutor, setHasUsedTutor] = useState(false);

    // Check if tutor was already used for this problem
    useEffect(() => {
        if (!problemId) return;

        const hasTutorMessage = messages.some(m =>
            m.role === 'assistant' &&
            (m.content.includes('✅') ||
                m.content.includes('⚠️') ||
                m.content.includes('Solution Verified') ||
                m.content.includes('test') && m.content.includes('passed'))
        );

        if (hasTutorMessage) {
            setHasUsedTutor(true);
            localStorage.setItem(`tutor_used_${problemId}_${language}`, 'true');
        } else {
            const locallyUsed = localStorage.getItem(`tutor_used_${problemId}_${language}`) === 'true';
            if (locallyUsed) setHasUsedTutor(true);
        }
    }, [problemId, language, messages]);

    const handleStartTutor = useCallback(() => {
        if (!problemId) {
            startTutor();
            return;
        }
        const key = `tutor_used_${problemId}_${language}`;
        localStorage.setItem(key, 'true');
        setHasUsedTutor(true);
        startTutor();
    }, [problemId, language, startTutor]);

    // Auto-start Tutor if requested
    useEffect(() => {
        if (autoStart && !isTutorActive && messages.length === 0 && !tutorLoading) {
            startTutor();
        }
    }, [autoStart, isTutorActive, messages.length, tutorLoading, startTutor]);

    // Helper function to update last interaction response length
    const updateLastInteractionResponse = (responseLength: number) => {
        try {
            const stored = localStorage.getItem('ai-interactions:v1');
            if (stored) {
                const interactions = JSON.parse(stored);
                if (interactions.length > 0) {
                    interactions[interactions.length - 1].responseLength = responseLength;
                    localStorage.setItem('ai-interactions:v1', JSON.stringify(interactions));
                }
            }
        } catch (error) {
            console.error('[Behavior Tracking] Failed to update response length:', error);
        }
    };

    // Load preferences on mount and when modal closes
    useEffect(() => {
        const loadPrefs = async () => {
            // 1. Load Local
            const loadedLocal = loadAIPreferences();

            // 2. Load Server
            let loadedServer = {};
            try {
                const res = await fetch('/api/ai/preferences');
                if (res.ok) {
                    const data = await res.json();
                    if (data && !data.error) {
                        loadedServer = data;
                    }
                }
            } catch (e) {
                console.error('Failed to load server preferences:', e);
            }

            // 3. Infer
            const inferred = inferPreferencesFromProfile({ codeforcesRating });
            const behaviorPatterns = loadBehaviorPatterns();
            const behaviorInferred = behaviorPatterns
                ? inferPreferencesFromBehavior(behaviorPatterns, codeforcesRating)
                : {};

            // Merge: Server > Local > Behavior > Inferred
            setPreferences({
                ...inferred,
                ...behaviorInferred,
                ...loadedLocal,
                ...loadedServer
            });
        };

        loadPrefs();
    }, [codeforcesRating, showPreferencesModal]);



    // Update input when selected code or initial question changes
    useEffect(() => {
        if (selectedCode && selectedCode.trim()) {
            // Pre-fill input with a simple prompt if input is empty
            if (!input.trim() && !initialQuestion) {
                setInput('Explain this code');
            }
        } else if (initialQuestion && !input.trim()) {
            setInput(initialQuestion);
        }
    }, [selectedCode, initialQuestion, input]);

    // Tutor Logic
    // The handleStartTutor function is now managed by the useTutorSession hook.
    // Call startTutor() from the hook where this function was previously invoked.

    const chatAbortControllerRef = useRef<AbortController | null>(null);

    const stopGeneration = useCallback(() => {
        if (tutorLoading || isTutorActive) {
            stopTutor();
        }
        if (chatAbortControllerRef.current) {
            chatAbortControllerRef.current.abort();
            chatAbortControllerRef.current = null;
        }
        setIsLoadingByTab(prev => ({ ...prev, [activeChatTab]: false }));
        setAiStatusByTab(prev => ({ ...prev, [activeChatTab]: 'Thinking...' }));
    }, [tutorLoading, isTutorActive, stopTutor, activeChatTab]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (overridePrompt?: string, file?: File) => {
        const promptToSend = (overridePrompt || input).trim();
        if (!promptToSend || isLoadingMessage) return;

        // Detect "teach me" to auto-trigger tutor
        if (promptToSend.toLowerCase().includes('teach me') && !hasUsedTutor && (onSolveProblem || onAiCodeUpdate)) {
            // Still show the user message in chat
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: promptToSend,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);
            if (!overridePrompt) setInput('');

            // Start tutor after adding user message so it appears chronologically correct
            handleStartTutor();
            return;
        }

        // Check LLM Configuration
        if (!settings.enabled || !settings.apiKey) {
            setShowPreferencesModal(true);
            return;
        }

        // Analyze question for behavior tracking
        const questionAnalysis = analyzeQuestion(promptToSend);

        // Track interaction for learning
        trackInteraction({
            questionLength: questionAnalysis.length,
            questionType: questionAnalysis.type,
            responseLength: 0, // Will be updated after response
            language: questionAnalysis.language,
            hasCodeSelection: !!(selectedCode && selectedCode.trim())
        });

        // Check if there's selected code to include
        const hasSelectedCode = selectedCode && selectedCode.trim();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: promptToSend,
            timestamp: new Date(),
            ...(hasSelectedCode && {
                codeBlock: {
                    code: selectedCode!,
                    language: language,
                    lineReference: selectedLineReference
                }
            })
        };

        setMessages(prev => [...prev, userMessage]);

        // Clear input only if it wasn't an override prompt
        if (!overridePrompt) {
            setInput('');
        }

        if (onSelectionCleared) {
            onSelectionCleared(); // Notify parent to clear selection
        }
        setIsLoadingMessage(true);
        setAiStatus('Reading the problem...');

        // Create streaming message ID before try so catch can access it
        const streamMsgId = `ai-${Date.now()}`;

        try {
            const chatMessages: any[] = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
                role: m.role,
                content: m.content
            }));

            let contentString = promptToSend;
            if (hasSelectedCode) {
                contentString += `\n\nCode Context:\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n`;
            }
            if (problemDescription && !messages.length) {
                contentString = `Problem Description: ${problemDescription}\n\n` + contentString;
            }

            chatMessages.push({ role: 'user', content: contentString });

            // Load solution style preference
            const solutionStyle = (typeof window !== 'undefined' ? localStorage.getItem('verdict_solution_style') : 'simple') || 'simple';
            const styleInstruction = solutionStyle === 'smart'
                ? 'When writing code solutions, prefer the most optimal time/space complexity. Show the most efficient approach even if it requires advanced data structures or algorithms.'
                : 'When writing code solutions, prefer simple and readable code that is easy to understand. Avoid over-optimizing — a clean O(n²) solution is fine if it fits the constraints. Focus on clear logic over performance tricks.';

            const thinkInstruction = 'Always enclose your detailed, step-by-step thinking process inside <think>...</think> tags. After your thought process, provide a concise final summary and explanation as your main response.';

            let currentMessages = [
                { role: 'system', content: settings.systemPrompt + '\n\n' + styleInstruction + '\n\n' + thinkInstruction },
                ...chatMessages
            ];

            setAiStatus('Thinking...');

            // Create streaming assistant message (uses streamMsgId from outer scope)
            addMessage({
                id: streamMsgId,
                role: 'assistant',
                content: '<think>\nThinking...\n</think>',
                timestamp: new Date()
            });
            setIsLoadingMessage(false); // Hide loading dots, we have a message now

            const tools = [
                {
                    type: 'function',
                    function: {
                        name: 'search_web',
                        description: 'Searches the web for up-to-date documentation, tutorials, coding best practices, and other real-world information. Call this when you need factual answers, algorithms, or resources.',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The search query. Keep it concise but descriptive.'
                                }
                            },
                            required: ['query']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'run_code',
                        description: `Executes code in an isolated sandbox and returns stdout/stderr. Use this to verify algorithms, test edge cases, or do complex computation before answering the user. Ensure the code is written in the user's selected language: ${language}. DO NOT write interactive console input logic as stdin is empty.`,
                        parameters: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'The source code string to execute.'
                                }
                            },
                            required: ['code']
                        }
                    }
                },
                {
                    type: 'function',
                    function: {
                        name: 'lookup_solution',
                        description: `Looks up a VERIFIED ACCEPTED solution for a Codeforces problem from the archives. Use this when you are stuck or want to verify your approach against a known-correct solution. The current problem ID is: ${problemId || 'unknown'}.`,
                        parameters: {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    }
                }
            ];

            let attempt = 0;
            let finalAiResponse = '';

            if (chatAbortControllerRef.current) {
                chatAbortControllerRef.current.abort();
            }
            chatAbortControllerRef.current = new AbortController();
            const signal = chatAbortControllerRef.current.signal;

            while (attempt < 3) {
                const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:]\/)\/+/g, "$1"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${settings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: settings.model,
                        messages: currentMessages,
                        tools: tools,
                        tool_choice: 'auto'
                    }),
                    signal
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        throw new Error('You have exceeded your API rate limit or quota. Please check your AI provider billing details.');
                    }
                    throw new Error('Failed to get AI response');
                }

                const data = await response.json();
                const responseMessage = data.choices?.[0]?.message;

                // Track token usage
                if (data.usage) {
                    try {
                        const usageCtx = (window as any).__aiContextUsage;
                        if (usageCtx?.addUsage) {
                            usageCtx.addUsage(data.usage.prompt_tokens || 0, data.usage.completion_tokens || 0);
                        }
                    } catch { /* ignore */ }
                }

                if (!responseMessage) {
                    throw new Error('No message in AI response');
                }

                if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                    currentMessages.push(responseMessage);

                    const isRunningCode = responseMessage.tool_calls.some((tc: any) => tc.function.name === 'run_code');
                    const isLookingUp = responseMessage.tool_calls.some((tc: any) => tc.function.name === 'lookup_solution');
                    setAiStatus(isRunningCode ? 'Evaluating code snippet...' : isLookingUp ? 'Looking up reference solution...' : 'Searching the web...');

                    const promises = responseMessage.tool_calls.map(async (toolCall: any) => {
                        if (toolCall.function.name === 'search_web') {
                            try {
                                const args = JSON.parse(toolCall.function.arguments);
                                const searchRes = await fetch('/api/search', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ query: args.query })
                                });
                                const searchData = await searchRes.json();
                                // Inject sources as a chat message
                                if (searchData.results?.length) {
                                    const srcMsg: Message = {
                                        id: `src-${Date.now()}`,
                                        role: 'sources',
                                        content: '',
                                        timestamp: new Date(),
                                        sources: searchData.results
                                    };
                                    setMessages(prev => [...prev, srcMsg]);
                                }
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'search_web',
                                    content: JSON.stringify(searchData.results || searchData.error)
                                };
                            } catch (e: any) {
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'search_web',
                                    content: JSON.stringify({ error: e.message })
                                };
                            }
                        } else if (toolCall.function.name === 'run_code') {
                            try {
                                const args = JSON.parse(toolCall.function.arguments);
                                const runRes = await fetch('/api/judge/run', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ code: args.code, language: language })
                                });
                                const runData = await runRes.json();
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'run_code',
                                    content: JSON.stringify(runData)
                                };
                            } catch (e: any) {
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'run_code',
                                    content: JSON.stringify({ error: e.message })
                                };
                            }
                        } else if (toolCall.function.name === 'lookup_solution') {
                            try {
                                if (!problemId) {
                                    return {
                                        tool_call_id: toolCall.id,
                                        role: 'tool',
                                        name: 'lookup_solution',
                                        content: JSON.stringify({ error: 'No problem is currently loaded.' })
                                    };
                                }
                                const [contestIdStr, pIndex] = problemId.split('-');
                                const solRes = await fetch('/api/solutions/fetch', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ contestId: contestIdStr, problemIndex: pIndex, language })
                                });
                                const solData = await solRes.json();
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'lookup_solution',
                                    content: JSON.stringify(solData)
                                };
                            } catch (e: any) {
                                return {
                                    tool_call_id: toolCall.id,
                                    role: 'tool',
                                    name: 'lookup_solution',
                                    content: JSON.stringify({ error: e.message })
                                };
                            }
                        }
                        return null;
                    });

                    const toolResponses = (await Promise.all(promises)).filter(Boolean);
                    currentMessages.push(...toolResponses);
                    attempt++;
                    setAiStatus('Composing answer...');
                } else {
                    finalAiResponse = responseMessage.content || '';
                    break;
                }
            }

            if (!finalAiResponse) finalAiResponse = 'I apologize, but I couldn\'t generate a response. Please try again.';

            // Stream the response word-by-word into the existing message
            const words = finalAiResponse.split(' ');
            let streamed = '';
            for (let i = 0; i < words.length; i++) {
                streamed += (i > 0 ? ' ' : '') + words[i];
                updateMessage(streamMsgId, streamed);
                await new Promise(r => setTimeout(r, 18));
            }
            // Ensure final content is set
            updateMessage(streamMsgId, finalAiResponse);

            // Update last interaction with response length for learning
            updateLastInteractionResponse(finalAiResponse.length);

        } catch (error) {
            console.error('[AI Chat Error]', error);
            updateMessage(streamMsgId, 'Sorry, I encountered an error. Please try again or check your connection.');
        } finally {
            setIsLoadingMessage(false);
        }
    };

    return (
        <AIContextUsageProvider maxTokens={128000}>
            <AIContextUsageTracker
                messages={messages}
                modelName={settings.model}
                problemDescription={problemDescription}
                userCode={userCode}
            />
            <div className="flex flex-col h-full bg-[#0e0e13] min-h-0 text-white" data-lenis-prevent>

                {/* ── Chat Tab Bar ─────────────────────────────────── */}
                <div className="flex items-center gap-0 border-b border-white/[0.06] shrink-0 bg-[#0a0a0f] overflow-x-auto">
                    {chatTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveChatTab(tab.id)}
                            className={`group/tab flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all shrink-0 ${activeChatTab === tab.id
                                ? 'border-emerald-500 text-white/90 bg-white/[0.03]'
                                : 'border-transparent text-white/35 hover:text-white/60 hover:bg-white/[0.02]'
                                }`}
                        >
                            <MessageSquare size={12} strokeWidth={2} />
                            {tab.label}
                            <span
                                onClick={(e) => { e.stopPropagation(); deleteChat(tab.id); }}
                                className="ml-0.5 p-0.5 rounded opacity-0 group-hover/tab:opacity-100 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all cursor-pointer"
                                title="Delete chat"
                            >
                                <X size={10} strokeWidth={2.5} />
                            </span>
                        </button>
                    ))}
                    <button
                        onClick={addNewChat}
                        className="flex items-center justify-center w-8 h-8 my-0.5 mx-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all shrink-0"
                        title="New chat"
                    >
                        <Plus size={14} strokeWidth={2} />
                    </button>
                </div>


                {/* ── Messages ───────────────────────────────────── */}
                <Conversation className="relative flex-1 min-h-0 bg-[#0e0e13]">
                    <ConversationContent className="px-3 py-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center mb-4 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.12)]">
                                    <Image src="/icons/logo.webp" alt="Verdict" fill className="object-contain p-2.5 opacity-80" />
                                </div>
                                <h3 className="text-base font-semibold text-white/80 mb-1.5">How can I help?</h3>
                                <p className="text-xs text-white/35 max-w-[220px] leading-relaxed">
                                    Ask about algorithms, debug your code, or get problem-solving hints.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            {messages.map((message) => {
                                if (message.role === 'sources' && message.sources?.length) {
                                    return (
                                        <div key={message.id} className="px-1 py-2">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Globe size={10} className="text-white/25" />
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">Sources</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                {message.sources.map((src, i) => {
                                                    let domain = '';
                                                    try { domain = new URL(src.url).hostname.replace('www.', ''); } catch { }
                                                    const isYT = src.type === 'youtube' || domain.includes('youtube');
                                                    return (
                                                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.14] transition-all group"
                                                        >
                                                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${isYT ? 'bg-red-500/15' : 'bg-white/5'
                                                                }`}>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                                                                    alt=""
                                                                    className="w-3.5 h-3.5 rounded-sm opacity-80"
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="text-[12px] text-white/70 group-hover:text-white/95 font-medium truncate">{src.title || domain}</div>
                                                                <div className="text-[10px] text-white/25 truncate mt-0.5">{domain}</div>
                                                            </div>
                                                            {isYT && (
                                                                <div className="text-[9px] font-semibold text-red-400/70 uppercase tracking-wide flex-shrink-0">YT</div>
                                                            )}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return <ChatMessage key={message.id} message={message as any} isAuthenticated={true} userEmail="You" />;
                            })}

                            {isLoadingMessage && (
                                <div className="flex items-center gap-3 py-3">
                                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 relative overflow-hidden">
                                        <Image src="/icons/logo.webp" alt="AI" fill className="object-contain p-1.5 opacity-60" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex gap-1 items-center">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-white/30 animate-pulse">{aiStatus}</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <div className="bg-[#0e0e13] border-t border-white/[0.06] px-3 pt-2.5 pb-3 shrink-0 relative z-10">

                    {/* Selected code context badge */}
                    {selectedCode?.trim() && selectedLineReference && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 text-blue-300/80 text-[11px] font-mono overflow-hidden">
                                <Code size={11} className="shrink-0" />
                                <span className="truncate">{selectedLineReference.replace('@ ', '')}</span>
                            </div>
                            <button onClick={() => onSelectionCleared?.()} className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-colors text-xs">
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Configure LLM banner */}
                    {user && (!settings.enabled || !settings.apiKey) && (
                        <button
                            onClick={() => setShowPreferencesModal(true)}
                            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.13] border border-emerald-500/20 rounded-2xl text-emerald-400 text-[12px] font-medium transition-all group"
                        >
                            <BrainCircuit size={14} strokeWidth={2} />
                            Configure Bring Your Own LLM
                        </button>
                    )}

                    {/* Chat input + action buttons */}
                    {!authLoading && !user ? (
                        <div className="w-full mb-3 flex flex-col gap-3 p-4 bg-[#141419] border border-white/[0.08] rounded-2xl relative overflow-hidden">
                            <div className="relative z-10 flex flex-col gap-1.5">
                                <h4 className="text-[13px] font-semibold text-white/90">Sign in to use the AI Tutor</h4>
                                <p className="text-[11px] text-white/50 mb-2">We ask you to sign in to prevent API abuse.</p>

                                <button
                                    onClick={() => setShowSignInModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg text-[12px] transition-colors"
                                >
                                    <BrainCircuit size={14} strokeWidth={2} />
                                    <span>Bring your own LLM</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={`transition-opacity duration-200 ${(!settings.enabled || !settings.apiKey) ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <PromptInputBox
                                value={input}
                                onChange={setInput}
                                isLoading={isLoadingMessage || tutorLoading}
                                placeholder={
                                    !settings.enabled || !settings.apiKey ? 'Configure LLM first...'
                                        : selectedCode && selectedLineReference ? 'Ask about the selected code...'
                                            : 'Ask anything...'
                                }
                                onSend={(msg) => handleSendMessage(msg)}
                                onStop={stopGeneration}
                                onOpenResources={() => setIsResourcesOpen(true)}
                                onTeachMe={() => handleSendMessage('Teach me this problem')}
                                isTutorLoading={tutorLoading}
                                isTutorActive={isTutorActive}
                                hasUsedTutor={hasUsedTutor && !(onSolveProblem || onAiCodeUpdate)}
                            />
                        </div>
                    )}

                    {/* Bottom action row: Settings */}
                    <div className="flex items-center justify-end mt-2">
                        <button
                            onClick={() => setShowPreferencesModal(true)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-white/25 hover:text-white/60 transition-colors"
                            title="AI Settings"
                        >
                            <Settings size={13} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* ── Resources Drawer Overlay ──────────────────────────────── */}
                <AnimatePresence>
                    {isResourcesOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsResourcesOpen(false)}
                                className="absolute inset-0 bg-black/40 z-40"
                            />
                            {/* Drawer */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className="absolute inset-y-0 right-0 w-full sm:w-[90%] bg-[#1c1c1f] shadow-2xl z-50 flex flex-col border-l border-white/10"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1c1c1f]">
                                    <h3 className="text-sm font-semibold text-white/90">Resources</h3>
                                    <button
                                        onClick={() => setIsResourcesOpen(false)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-8 bg-[#161619]">
                                    {concepts.length === 0 && (
                                        <div className="text-center py-10 text-white/40 text-sm">
                                            No resources available yet. Start a session or ask a question to generate resources.
                                        </div>
                                    )}

                                    {/* Video Tutorials */}
                                    {concepts.filter(c => c.type === 'video').length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 tracking-wider">
                                                <PlayCircle size={14} />
                                                VIDEO TUTORIALS
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {concepts.filter(c => c.type === 'video').map((c, i) => (
                                                    <a key={i} href={c.url} target="_blank" rel="noreferrer" className="group flex gap-3 text-left transition-colors hover:bg-white/5 p-2 rounded-xl -m-2">
                                                        <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Youtube className="w-8 h-8 text-red-500 opacity-90 group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-white/90">Play</div>
                                                        </div>
                                                        <div className="flex flex-col justify-center">
                                                            <h4 className="text-sm font-medium text-white/90 group-hover:text-white line-clamp-2 leading-tight">{c.title}</h4>
                                                            <p className="text-xs text-white/40 mt-1">YouTube</p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Articles & Wikis */}
                                    {concepts.filter(c => c.type === 'article').length > 0 && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 tracking-wider">
                                                <Globe size={14} />
                                                ARTICLES & WIKIS
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                {concepts.filter(c => c.type === 'article').map((c, i) => {
                                                    let domain = 'Website';
                                                    try {
                                                        domain = new URL(c.url).hostname.replace('www.', '');
                                                    } catch (e) {
                                                        // Ignore invalid URLs
                                                    }
                                                    return (
                                                        <a key={i} href={c.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                                    {domain.includes('wikipedia') ? (
                                                                        <Globe className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                                                                    ) : (
                                                                        <BookOpen className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="text-sm font-medium text-white/90 group-hover:text-white truncate">{c.title}</h4>
                                                                    <p className="text-xs text-white/40 mt-0.5">{domain}</p>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* AI Preferences Modal */}
                <AIPreferencesModal
                    isOpen={showPreferencesModal}
                    onClose={() => setShowPreferencesModal(false)}
                    codeforcesRating={codeforcesRating}
                    variants={variants}
                    selectedLevel={selectedLevel}
                    onLevelChange={changeLevel}
                    onPreferencesSaved={() => {
                        const loaded = loadAIPreferences();
                        const inferred = inferPreferencesFromProfile({ codeforcesRating });
                        setPreferences({ ...inferred, ...loaded });
                    }}
                />

                <SignInModal
                    isOpen={showSignInModal}
                    onClose={() => setShowSignInModal(false)}
                />
            </div>
        </AIContextUsageProvider>
    );
}

// Bridge component that exposes context to window for imperative token tracking
function AIContextUsageTracker({ messages, modelName, problemDescription, userCode }: { messages: Message[], modelName: string, problemDescription?: string, userCode?: string }) {
    const ctx = useAIContextUsage();

    // Imperative bridge for active generation
    useEffect(() => {
        (window as any).__aiContextUsage = ctx;
        return () => { delete (window as any).__aiContextUsage; };
    }, [ctx]);

    // Reactive context sizing
    useEffect(() => {
        let maxTokens = 32000;
        if (modelName) {
            const m = modelName.toLowerCase();
            // Google
            if (m.includes('gemini-1.5')) maxTokens = 1000000;
            else if (m.includes('gemini')) maxTokens = 32000;
            // Anthropic
            else if (m.includes('claude-3') || m.includes('claude-2.1')) maxTokens = 200000;
            else if (m.includes('claude-2')) maxTokens = 100000;
            // OpenAI
            else if (m.includes('gpt-4o') || m.includes('gpt-4-turbo')) maxTokens = 128000;
            else if (m.includes('gpt-4-32k')) maxTokens = 32768;
            else if (m.includes('gpt-4')) maxTokens = 8192;
            else if (m.includes('gpt-3.5-turbo-16k') || m.includes('gpt-3.5-turbo-0125')) maxTokens = 16384;
            else if (m.includes('gpt-3.5')) maxTokens = 4096;
            // Meta Llama
            else if (m.includes('llama-3.1') || m.includes('llama-3.2') || m.includes('llama-3.3')) maxTokens = 128000;
            else if (m.includes('llama-3')) maxTokens = 8192;
            else if (m.includes('llama-2')) maxTokens = 4096;
            // Mistral
            else if (m.includes('mistral-large') || m.includes('mistral-nemo')) maxTokens = 128000;
            else if (m.includes('mixtral')) maxTokens = 32768;
            else if (m.includes('mistral')) maxTokens = 8192;
            // Qwen
            else if (m.includes('qwen')) maxTokens = 128000;
            // DeepSeek
            else if (m.includes('deepseek')) maxTokens = 128000;
            // Cohere
            else if (m.includes('command-r')) maxTokens = 128000;
        }

        let txt = (problemDescription || '') + '\n' + (userCode || '');
        for (const msg of messages) {
            txt += '\n' + msg.content;
            if (msg.role === 'sources' && msg.sources) {
                txt += '\n' + JSON.stringify(msg.sources);
            }
        }

        let isMounted = true;
        import('gpt-tokenizer').then(({ encode }) => {
            if (!isMounted) return;
            const tokens = encode(txt).length;
            ctx.setUsageData({
                inputTokens: tokens,
                outputTokens: 0,
                maxTokens: maxTokens,
                totalTokens: tokens
            });
        }).catch(err => console.error('[Token Count Error]', err));

        return () => { isMounted = false; };
    }, [messages, modelName, problemDescription, userCode, ctx.setUsageData]);

    return null;
}
