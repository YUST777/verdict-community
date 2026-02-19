'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SendHorizontal, Loader2, Wand2, Lock, Code, Settings } from 'lucide-react';
// @ts-expect-error - module may not exist in this branch
import { loadAIPreferences, inferPreferencesFromProfile, AILearningPreferences } from '@/lib/ai-personalization';
// @ts-expect-error - module may not exist in this branch
import { useAIAuth } from '@/lib/hooks/useAIAuth';
// @ts-expect-error - module may not exist in this branch
import SignInModal from '@/app/components/auth/SignInModal';
import AIPreferencesModal from './AIPreferencesModal';
// @ts-expect-error - module may not exist in this branch
import { trackInteraction, analyzeQuestion, loadBehaviorPatterns, inferPreferencesFromBehavior } from '@/lib/ai-behavior-learning';
import ChatMessage from './ChatMessage';
import ConceptChips from './ConceptChips';
import { useTutorSession } from './useTutorSession';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    codeBlock?: {
        code: string;
        language: string;
        lineNumbers?: { start: number; end: number };
        lineReference?: string; // e.g., "@ lines 3-4"
    };
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
    problemId
}: AIAgentPanelProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(initialQuestion || '');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [preferences, setPreferences] = useState<Partial<AILearningPreferences>>({});
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load messages from DB on mount
    useEffect(() => {
        if (!problemId) return;

        const fetchHistory = async () => {
            try {
                const parts = problemId.split('-');
                if (parts.length < 2) {
                    console.log('[AI History] Invalid problemId format:', problemId);
                    return;
                }

                const cIdSafe = parts[0];
                const pIdSafe = parts.slice(1).join('-');

                console.log('[AI History] Fetching history for:', { contestId: cIdSafe, problemId: pIdSafe });

                const res = await fetch(`/api/ai/chat/history?contestId=${cIdSafe}&problemId=${pIdSafe}`);
                const data = await res.json();

                console.log('[AI History] Response:', data);

                if (data.success && Array.isArray(data.history)) {
                    // Restore Date objects
                    const hydratedMessages = data.history.map((m: { id: string; role: string; content: string; timestamp: string; codeBlock?: { code: string; language: string; lineReference?: string } }) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }));
                    console.log('[AI History] Loaded messages:', hydratedMessages.length);
                    setMessages(hydratedMessages);
                } else {
                    console.log('[AI History] No history or invalid response');
                }
            } catch (e) {
                console.error('[AI History] Failed to load chat history from DB:', e);
            }
        };

        fetchHistory();
    }, [problemId]);

    // Save messages to LocalStorage whenever they change
    // No longer auto-save to LocalStorage
    // We save each message individually to DB via API calls in handleSendMessage/onReceive
    /*
    useEffect(() => {
        if (!problemId || messages.length === 0) return;
        const key = `verdict_ai_chat_${problemId}`;
        localStorage.setItem(key, JSON.stringify(messages));
    }, [messages, problemId]);
    */

    // Authentication hook
    const { isAuthenticated, isLoading: authLoading, user, getHeaders, handleAuthError, checkAuth } = useAIAuth();

    // Message helpers for hook
    const addMessage = useCallback((msg: { id: string; role: 'assistant'; content: string; timestamp: Date; codeBlock?: { code: string; language: string; lineReference?: string } }) => {
        setMessages(prev => [...prev, msg]);
        
        // Save to DB
        if (problemId) {
            const parts = problemId.split('-');
            if (parts.length >= 2) {
                const contestId = parts[0];
                const problemIdPart = parts.slice(1).join('-');
                
                console.log('[AI DB Save] Saving assistant message:', { contestId, problemId: problemIdPart, hasCodeBlock: !!msg.codeBlock });
                
                fetch('/api/ai/chat/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contestId,
                        problemId: problemIdPart,
                        message: {
                            role: msg.role,
                            content: msg.content,
                            codeBlock: msg.codeBlock
                        },
                        context: {
                            title: 'Unknown',
                            language
                        }
                    })
                }).then(res => res.json())
                  .then(data => console.log('[AI DB Save] Assistant message saved:', data))
                  .catch(err => console.error('[AI DB] Failed to save assistant message:', err));
            }
        }
    }, [problemId, language]);

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
        getHeaders,
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

    const handleSendMessage = async () => {
        if (!input.trim() || isLoadingMessage) return;

        // Check authentication
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }

        // Analyze question for behavior tracking
        const questionAnalysis = analyzeQuestion(input);

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
            content: input,
            timestamp: new Date(),
            ...(hasSelectedCode && {
                codeBlock: {
                    code: selectedCode,
                    language: language,
                    lineReference: selectedLineReference
                }
            })
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentSelectedCode = selectedCode;
        setInput('');
        if (onSelectionCleared) {
            onSelectionCleared(); // Notify parent to clear selection
        }
        setIsLoadingMessage(true);

        // Save User Message to DB
        if (problemId) {
            const parts = problemId.split('-');
            if (parts.length >= 2) {
                const contestId = parts[0];
                const problemIdPart = parts.slice(1).join('-');
                
                console.log('[AI DB Save] Saving user message:', { contestId, problemId: problemIdPart, hasCodeBlock: !!userMessage.codeBlock });
                
                fetch('/api/ai/chat/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contestId,
                        problemId: problemIdPart,
                        message: userMessage,
                        context: {
                            title: 'Unknown',
                            language,
                            problemDescription
                        }
                    })
                }).then(res => res.json())
                  .then(data => console.log('[AI DB Save] User message saved:', data))
                  .catch(err => console.error('[AI DB] Failed to save user message:', err));
            }
        }

        try {
            // Call AI API with personalized preferences and auth headers
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    prompt: currentInput,
                    userCode: userCode,
                    problemDescription: problemDescription,
                    selectedCode: currentSelectedCode,
                    preferences: preferences,
                    problemTags: problemTags,
                    problemDifficulty: problemDifficulty,
                    language: language,
                    problemContextId: problemId // Pass unified ID for server-side saving
                })
            });

            // Handle auth errors
            if (response.status === 401 || response.status === 403) {
                const authResult = await handleAuthError(response);
                if (authResult.needsAuth) {
                    setShowSignInModal(true);
                    // Remove the user message since we couldn't send
                    setMessages(prev => prev.filter(m => m.id !== userMessage.id));
                    setInput(currentInput); // Restore input
                    return;
                }
                // If we got a new CSRF token, retry the request
                if (authResult.newCsrfToken) {
                    const retryResponse = await fetch('/api/ai/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-csrf-token': authResult.newCsrfToken
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            prompt: currentInput,
                            userCode: userCode,
                            problemDescription: problemDescription,
                            selectedCode: currentSelectedCode,
                            preferences: preferences,
                            problemTags: problemTags,
                            problemDifficulty: problemDifficulty,
                            language: language,
                            problemContextId: problemId
                        })
                    });

                    if (!retryResponse.ok) {
                        throw new Error('Failed to get AI response after retry');
                    }

                    const data = await retryResponse.json();
                    const aiResponse = data.response || data.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

                    const aiMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: aiResponse,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);

                    // Update last interaction with response length
                    updateLastInteractionResponse(aiResponse.length);
                    return;
                }
            }

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            const aiResponse = data.response || data.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Update last interaction with response length for learning
            updateLastInteractionResponse(aiResponse.length);

            // TTS disabled for now - don't set explanation
            // setTtsExplanation(aiResponse);
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
        <div className="flex flex-col h-full bg-[#0a0a0a] min-h-0">
            {/* Ultra Minimal Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 relative">
                        <Image
                            src="/icons/logo.webp"
                            alt="Verdict"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xs font-medium text-white/70">AI Tutor</span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Teach Me Button - Compact */}
                    {(onSolveProblem || onAiCodeUpdate) && !hasUsedTutor && (
                        <button
                            onClick={handleStartTutor}
                            disabled={tutorLoading || isTutorActive}
                            className="px-2 py-1 text-[10px] font-medium rounded-md transition-all flex items-center gap-1 bg-emerald-500/90 hover:bg-emerald-500 text-white"
                            title="Get AI guidance"
                        >
                            {tutorLoading ? (
                                <Loader2 size={10} className="animate-spin" strokeWidth={2.5} />
                            ) : (
                                <Wand2 size={10} strokeWidth={2.5} />
                            )}
                            <span>Teach</span>
                        </button>
                    )}
                    {/* Settings - Icon only */}
                    <button
                        onClick={() => setShowPreferencesModal(true)}
                        className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white/70"
                        title="Settings"
                    >
                        <Settings size={12} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Solution Levels - Compact with Complexity */}
            {variants && variants.length > 0 && (
                <div className="px-3 py-2 border-b border-white/5">
                    <div className="flex gap-1.5">
                        {variants.map((v) => {
                            const isSelected = selectedLevel === v.level;
                            let bgClass = "bg-white/5 hover:bg-white/10";
                            let textClass = "text-white/50 hover:text-white/70";
                            let borderClass = "border-white/10";
                            
                            if (isSelected) {
                                if (v.level === 1) {
                                    bgClass = "bg-orange-500/15";
                                    textClass = "text-orange-400";
                                    borderClass = "border-orange-500/30";
                                }
                                if (v.level === 2) {
                                    bgClass = "bg-blue-500/15";
                                    textClass = "text-blue-400";
                                    borderClass = "border-blue-500/30";
                                }
                                if (v.level === 3) {
                                    bgClass = "bg-emerald-500/15";
                                    textClass = "text-emerald-400";
                                    borderClass = "border-emerald-500/30";
                                }
                            }

                            return (
                                <button
                                    key={v.level}
                                    onClick={() => changeLevel(v.level)}
                                    className={`flex-1 py-1.5 px-2 rounded-md border transition-all ${bgClass} ${textClass} ${borderClass}`}
                                >
                                    <div className="text-[10px] font-semibold mb-0.5">{v.title}</div>
                                    {v.timeComplexity && (
                                        <div className="text-[8px] opacity-60 font-mono">
                                            {v.timeComplexity}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Messages - Cleaner spacing */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3 relative overflow-hidden">
                            <Image
                                src="/icons/logo.webp"
                                alt="Verdict"
                                fill
                                className="object-contain p-2"
                            />
                        </div>
                        <h3 className="text-sm font-medium text-white/80 mb-1">
                            Ask me anything
                        </h3>
                        <p className="text-xs text-white/40 max-w-[280px]">
                            Get help with algorithms, debug code, or learn problem-solving strategies
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        isAuthenticated={isAuthenticated}
                        userEmail={user?.email}
                    />
                ))}

                {isLoadingMessage && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                            <Image
                                src="/icons/logo.webp"
                                alt="AI"
                                fill
                                className="object-contain p-1 opacity-50"
                            />
                        </div>
                        <div className="bg-[#151515] rounded-xl px-3 py-2 border border-white/5">
                            <div className="flex items-center gap-1.5">
                                <Loader2 size={11} className="animate-spin text-emerald-400" strokeWidth={2} />
                                <span className="text-xs text-white/50">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Concepts - Minimal */}
            <ConceptChips concepts={concepts} />

            {/* Input Area - Compact */}
            <div className="border-t border-white/5 px-3 py-3 shrink-0">
                {/* Selected Code Badge - Minimal */}
                {selectedCode && selectedCode.trim() && selectedLineReference && (
                    <div className="mb-2 flex items-center gap-1.5">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]">
                            <Code size={9} strokeWidth={2} />
                            <span className="font-mono">{selectedLineReference.replace('@ ', '')}</span>
                        </div>
                        <button
                            onClick={() => onSelectionCleared?.()}
                            className="text-[9px] text-white/30 hover:text-white/50 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Sign-in prompt - Compact */}
                {!isAuthenticated && !authLoading && (
                    <button
                        onClick={() => setShowSignInModal(true)}
                        className="mb-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-medium transition-all"
                    >
                        <Lock size={11} strokeWidth={2} />
                        Sign in to chat
                    </button>
                )}

                {/* Input Field - Compact */}
                <div className={`relative flex items-center gap-2 bg-[#151515] border border-white/10 rounded-lg px-2.5 py-2 focus-within:border-white/20 transition-all ${!isAuthenticated ? 'opacity-50' : ''}`}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={!isAuthenticated
                            ? "Sign in to ask..."
                            : selectedCode && selectedLineReference
                                ? `Ask about selected code...`
                                : "Ask anything..."}
                        className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
                        disabled={isLoadingMessage || !isAuthenticated}
                        style={{ direction: 'auto' as any, unicodeBidi: 'plaintext' }}
                    />

                    {/* Send Button - Compact */}
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoadingMessage || !isAuthenticated}
                        className="w-7 h-7 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-white/20 text-white rounded-md transition-all flex items-center justify-center shrink-0"
                    >
                        {isLoadingMessage ? (
                            <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
                        ) : (
                            <SendHorizontal size={13} strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* Sign In Modal */}
            <SignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                onSuccess={() => {
                    checkAuth();
                    setShowSignInModal(false);
                }}
                title="Sign in to use AI"
                subtitle="AI features require authentication to ensure fair usage"
            />

            {/* AI Preferences Modal */}
            <AIPreferencesModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                codeforcesRating={codeforcesRating}
                onPreferencesSaved={() => {
                    // Reload preferences when saved
                    const loaded = loadAIPreferences();
                    const inferred = inferPreferencesFromProfile({ codeforcesRating });
                    setPreferences({ ...inferred, ...loaded });
                }}
            />
        </div>
    );
}
