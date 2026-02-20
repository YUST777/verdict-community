'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, Wand2, Code, Settings, BrainCircuit, Globe, X, Youtube, BookOpen, ExternalLink, PlayCircle } from 'lucide-react';

import { loadAIPreferences, inferPreferencesFromProfile, AILearningPreferences } from '@/lib/ai-personalization';

import AIPreferencesModal from './AIPreferencesModal';

import { useLLM } from '@/lib/useLLM';
import { trackInteraction, analyzeQuestion, loadBehaviorPatterns, inferPreferencesFromBehavior } from '@/lib/ai-behavior-learning';
import ChatMessage from './ChatMessage';
import { useTutorSession } from './useTutorSession';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ui/conversation';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(initialQuestion || '');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [aiStatus, setAiStatus] = useState('Thinking...');
    const [preferences, setPreferences] = useState<Partial<AILearningPreferences>>({});
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const { settings } = useLLM();

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

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevInitialQuestion = useRef(initialQuestion);

    // Sync initialQuestion to input when it changes from the parent
    useEffect(() => {
        if (initialQuestion && initialQuestion !== prevInitialQuestion.current) {
            setInput(initialQuestion);
            prevInitialQuestion.current = initialQuestion;
        }
    }, [initialQuestion]);

    // Load messages from localStorage on mount
    useEffect(() => {
        if (!problemId) return;
        try {
            const key = `verdict_ai_chat_${problemId}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                const hydratedMessages = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                setMessages(hydratedMessages);
            }
        } catch (e) {
            console.error('[AI History] Failed to load chat history from storage:', e);
        }
    }, [problemId]);

    // Save messages to LocalStorage whenever they change
    useEffect(() => {
        if (!problemId || messages.length === 0) return;
        const key = `verdict_ai_chat_${problemId}`;
        localStorage.setItem(key, JSON.stringify(messages));
    }, [messages, problemId]);

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
    const { isTutorActive, isLoading: tutorLoading, concepts, startTutor, variants, selectedLevel, changeLevel } = useTutorSession({
        problemId,
        language,
        problemDescription,
        testCases,
        getHeaders: () => ({}),
        onAiCodeUpdate,
        onSwitchToAiTab,
        addMessage,
        updateMessage
    });

    // Tutor Usage Tracking (Once per problem per language)
    const [hasUsedTutor, setHasUsedTutor] = useState(false);

    // Check usage limits and restore state from DB history
    useEffect(() => {
        if (!problemId) return;

        // Check Message History from DB (Reliable/Cross-device)
        // If we have a message saying "Found a verified solution" or "Solution Verified", then we used the tutor.
        const hasTutorMessage = messages.some(m =>
            m.role === 'assistant' &&
            (m.content.includes('Solution Verified') ||
                m.content.includes('Found a verified solution') ||
                m.content.includes('Verdict Verification Protocol'))
        );

        if (hasTutorMessage) {
            setHasUsedTutor(true);
            // Sync to localStorage for faster checks
            const key = `tutor_used_${problemId}_${language}`;
            localStorage.setItem(key, 'true');
        } else {
            // Fallback to localStorage if no messages loaded yet
            const key = `tutor_used_${problemId}_${language}`;
            const locallyUsed = localStorage.getItem(key) === 'true';
            if (locallyUsed) {
                setHasUsedTutor(true);
            }
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

    // TTS disabled for now
    // const handlePlayTTS = async () => {
    //     console.log('[TTS] TTS is currently disabled');
    //     return;
    // };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (overridePrompt?: string, file?: File) => {
        const promptToSend = (overridePrompt || input).trim();
        if (!promptToSend || isLoadingMessage) return;

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
            const styleInstruction = solutionStyle === 'smart'
                ? 'When writing code solutions, prefer the most optimal time/space complexity. Show the most efficient approach even if it requires advanced data structures or algorithms.'
                : 'When writing code solutions, prefer simple and readable code that is easy to understand. Avoid over-optimizing — a clean O(n²) solution is fine if it fits the constraints. Focus on clear logic over performance tricks.';

            const thinkInstruction = 'Always enclose your detailed, step-by-step thinking process inside <think>...</think> tags. After your thought process, provide a concise final summary and explanation as your main response.';

            let currentMessages = [
                { role: 'system', content: settings.systemPrompt + '\n\n' + styleInstruction + '\n\n' + thinkInstruction },
                ...chatMessages
            ];

            setAiStatus('Thinking...');

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
                }
            ];

            let attempt = 0;
            let finalAiResponse = '';

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
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to get AI response');
                }

                const data = await response.json();
                const responseMessage = data.choices?.[0]?.message;

                if (!responseMessage) {
                    throw new Error('No message in AI response');
                }

                if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                    currentMessages.push(responseMessage);
                    setAiStatus('Searching the web...');

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

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: finalAiResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Update last interaction with response length for learning
            updateLastInteractionResponse(finalAiResponse.length);

            // TTS disabled for now - don't set explanation
            // setTtsExplanation(finalAiResponse);
        } catch (error) {
            console.error('[AI Chat Error]', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again or check your connection.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoadingMessage(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0e0e13] min-h-0 text-white" data-lenis-prevent>

            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg overflow-hidden relative border border-emerald-500/20 bg-emerald-500/5 flex-shrink-0">
                        <Image src="/icons/logo.webp" alt="Verdict" fill className="object-contain p-1" />
                    </div>
                    <span className="text-[13px] font-semibold tracking-wide text-white/90">AI Tutor</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {(onSolveProblem || onAiCodeUpdate) && !hasUsedTutor && (
                        <button
                            onClick={handleStartTutor}
                            disabled={tutorLoading || isTutorActive}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/90 hover:bg-emerald-400 text-black transition-all disabled:opacity-60"
                        >
                            {tutorLoading
                                ? <Loader2 size={11} className="animate-spin" strokeWidth={2.5} />
                                : <Wand2 size={11} strokeWidth={2.5} />}
                            Teach Me
                        </button>
                    )}
                    <button
                        onClick={() => setShowPreferencesModal(true)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/70 transition-colors"
                    >
                        <Settings size={13} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* ── Solution level pills ───────────────────────── */}
            {/* Removed level pills as per instruction */}
            {/* {variants && variants.length > 0 && (
                <div className="px-3 py-2 border-b border-white/[0.06] flex gap-1.5">
                    {variants.map((v) => {
                        const sel = selectedLevel === v.level;
                        const colors = [
                            { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' },
                            { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
                            { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
                        ];
                        const c = sel ? colors[(v.level - 1) % 3] : { bg: 'bg-white/[0.04] hover:bg-white/[0.07]', text: 'text-white/40 hover:text-white/60', border: 'border-white/[0.08]' };
                        return (
                            <button key={v.level} onClick={() => changeLevel(v.level)}
                                className={`flex-1 py-1.5 px-2 rounded-lg border transition-all ${c.bg} ${c.text} ${c.border}`}>
                                <div className="text-[10px] font-semibold">{v.title}</div>
                                {v.timeComplexity && <div className="text-[8px] opacity-50 font-mono mt-0.5">{v.timeComplexity}</div>}
                            </button>
                        );
                    })}
                </div>
            )} */}

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
                {(!settings.enabled || !settings.apiKey) && (
                    <button
                        onClick={() => setShowPreferencesModal(true)}
                        className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.13] border border-emerald-500/20 rounded-2xl text-emerald-400 text-[12px] font-medium transition-all group"
                    >
                        <BrainCircuit size={14} strokeWidth={2} />
                        Configure Bring Your Own LLM
                    </button>
                )}

                {/* Chat input */}
                <div className={`transition-opacity duration-200 ${(isLoadingMessage || !settings.enabled || !settings.apiKey) ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                    <PromptInputBox
                        isLoading={isLoadingMessage}
                        placeholder={
                            !settings.enabled || !settings.apiKey ? 'Configure LLM first...'
                                : selectedCode && selectedLineReference ? 'Ask about the selected code...'
                                    : 'Ask anything...'
                        }
                        onSend={(msg) => handleSendMessage(msg)}
                        onOpenResources={() => setIsResourcesOpen(true)}
                    />
                </div>
            </div>

            {/* ── Resources Drawer Overlay ──────────────────────────────── */}
            <div
                className={`absolute inset-y-0 right-0 w-full sm:w-[90%] bg-[#1c1c1f] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-white/10 ${isResourcesOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
            </div>

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
        </div>
    );
}
