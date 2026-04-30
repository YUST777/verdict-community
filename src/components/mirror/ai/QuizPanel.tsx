'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Brain, CheckCircle2, XCircle, AlertTriangle, ArrowRight, X, Loader2, RotateCcw } from 'lucide-react';

interface Question {
    q: string;
    type: string;
    line?: number;
    difficulty: string;
}

interface AnswerResult {
    qIndex: number;
    question: string;
    answer: string;
    rating: 'good' | 'partial' | 'weak';
    feedback: string;
    correctAnswer?: string;
}

interface QuizPanelProps {
    code: string;
    problemTitle?: string;
    problemStatement?: string;
    onExit: () => void;
}

export default function QuizPanel({ code, problemTitle, problemStatement, onExit }: QuizPanelProps) {
    const [phase, setPhase] = useState<'loading' | 'quiz' | 'results'>('loading');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answer, setAnswer] = useState('');
    const [evaluating, setEvaluating] = useState(false);
    const [results, setResults] = useState<AnswerResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Prevent double-fire from React Strict Mode or rapid re-mounts
    const abortRef = useRef<AbortController | null>(null);
    const hasStartedRef = useRef(false);

    // Generate questions
    const generateQuestions = useCallback(async (isRetry = false) => {
        // Cancel any in-flight request
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setPhase('loading');
        setError(null);
        setResults([]);
        setCurrentQ(0);
        setAnswer('');

        // Guard: need code to quiz on
        if (!code || !code.trim()) {
            setError('Write some code first, then quiz yourself on it.');
            return;
        }

        try {
            // Read user's LLM settings from localStorage
            let userSettings: any = {};
            try {
                const stored = localStorage.getItem('verdict_byok_llm');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.enabled && parsed.apiKey && parsed.baseURL) {
                        const { decryptValue } = await import('@/lib/client-encryption');
                        const decryptedKey = await decryptValue(parsed.apiKey);
                        userSettings = { ...parsed, apiKey: decryptedKey };
                    }
                }
            } catch {}

            const numberedCode = code.split('\n').map((line: string, i: number) => `${i + 1}: ${line}`).join('\n');

            const systemPrompt = `You are a strict but fair competitive programming tutor. Given the student's code, generate exactly 5 questions that test whether they TRULY understand it. Questions should go from easy to hard. Reference specific line numbers. Return ONLY a JSON array: [{"q":"question text","type":"line_explain","line":5,"difficulty":"easy"},...]`;

            const userPrompt = `Problem: ${problemTitle || 'Unknown'}\n\nCode:\n\`\`\`\n${numberedCode}\n\`\`\`\n\nGenerate 5 quiz questions.`;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                signal: controller.signal,
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    model: userSettings.model || undefined,
                    baseURL: userSettings.enabled ? userSettings.baseURL : undefined,
                    apiKey: userSettings.enabled ? userSettings.apiKey : undefined,
                }),
            });

            // If aborted between fetch and here, bail out
            if (controller.signal.aborted) return;

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 401) throw new Error('Please sign in to use the quiz feature.');
                if (res.status === 429) throw new Error('AI rate limit reached. Wait a moment and try again.');
                if (res.status === 503) throw new Error('No AI key configured. Go to AI Settings (⚙️) and add your API key.');
                throw new Error(errData.error || `AI service error (${res.status}). Check your LLM settings.`);
            }

            const data = await res.json();
            if (controller.signal.aborted) return;

            const text = data.choices?.[0]?.message?.content || '';
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error('AI did not return valid questions. Try again.');

            let parsed;
            try { parsed = JSON.parse(jsonMatch[0]); } catch { throw new Error('Failed to parse questions'); }
            if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No questions generated');

            // Final abort check before committing state
            if (controller.signal.aborted) return;

            setQuestions(parsed);
            setCurrentQ(0);
            setResults([]);
            setPhase('quiz');
        } catch (err: any) {
            if (err?.name === 'AbortError') return; // silently ignore aborted requests
            setError(err.message || 'Failed to start quiz');
        }
    }, [code, problemTitle, problemStatement]);

    // Auto-generate once on mount — abort on unmount
    useEffect(() => {
        // Strict Mode guard: only fire once
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        generateQuestions();

        return () => {
            // Abort in-flight request on unmount
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const submitAnswer = async () => {
        if (!answer.trim() || evaluating) return;
        setEvaluating(true);
        setError(null);

        try {
            let userSettings: any = {};
            try {
                const stored = localStorage.getItem('verdict_byok_llm');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.enabled && parsed.apiKey && parsed.baseURL) {
                        const { decryptValue } = await import('@/lib/client-encryption');
                        const decryptedKey = await decryptValue(parsed.apiKey);
                        userSettings = { ...parsed, apiKey: decryptedKey };
                    }
                }
            } catch {}

            const numberedCode = code.split('\n').map((line: string, i: number) => `${i + 1}: ${line}`).join('\n');

            const systemPrompt = `You are a strict tutor evaluating a student's answer about their code. Be honest: if correct say so briefly, if wrong correct them firmly. Return ONLY JSON: {"rating":"good"|"partial"|"weak","feedback":"1-3 sentences","correctAnswer":"if wrong"}`;

            const userPrompt = `Code:\n\`\`\`\n${numberedCode}\n\`\`\`\n\nQuestion: ${questions[currentQ].q}\nStudent's answer: ${answer.trim()}\n\nEvaluate.`;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    model: userSettings.model || undefined,
                    baseURL: userSettings.enabled ? userSettings.baseURL : undefined,
                    apiKey: userSettings.enabled ? userSettings.apiKey : undefined,
                }),
            });

            if (!res.ok) throw new Error('Evaluation failed');
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            let evaluation;
            if (jsonMatch) {
                try { evaluation = JSON.parse(jsonMatch[0]); } catch { evaluation = { rating: 'partial', feedback: text.substring(0, 200) }; }
            } else {
                evaluation = { rating: 'partial', feedback: text.substring(0, 200) || 'Could not evaluate.' };
            }

            const result: AnswerResult = {
                qIndex: currentQ,
                question: questions[currentQ].q,
                answer: answer.trim(),
                rating: evaluation.rating || 'partial',
                feedback: evaluation.feedback || 'Could not evaluate.',
                correctAnswer: evaluation.correctAnswer,
            };

            setResults(prev => [...prev, result]);
            setAnswer('');

            if (currentQ + 1 >= questions.length) {
                setPhase('results');
            } else {
                setCurrentQ(prev => prev + 1);
            }
        } catch {
            setError('Failed to evaluate answer. Try again.');
        } finally {
            setEvaluating(false);
        }
    };

    const getRatingIcon = (rating: string) => {
        if (rating === 'good') return <CheckCircle2 size={16} className="text-green-400" />;
        if (rating === 'partial') return <AlertTriangle size={16} className="text-yellow-400" />;
        return <XCircle size={16} className="text-red-400" />;
    };

    const getRatingColor = (rating: string) => {
        if (rating === 'good') return 'border-green-500/30 bg-green-500/5';
        if (rating === 'partial') return 'border-yellow-500/30 bg-yellow-500/5';
        return 'border-red-500/30 bg-red-500/5';
    };

    const getDifficultyColor = (d: string) => {
        if (d === 'easy') return 'text-green-400 bg-green-500/10';
        if (d === 'medium') return 'text-yellow-400 bg-yellow-500/10';
        return 'text-red-400 bg-red-500/10';
    };

    const score = results.filter(r => r.rating === 'good').length;
    const total = questions.length;

    // Loading state
    if (phase === 'loading') {
        return (
            <div className="h-full flex flex-col p-4">
                {error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <XCircle size={32} className="text-red-400 mb-3" />
                        <p className="text-red-400 text-sm mb-4">{error}</p>
                        <button onClick={generateQuestions} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors">
                            Try Again
                        </button>
                        <button onClick={onExit} className="mt-2 text-[#666] text-xs hover:text-white transition-colors">
                            Exit Quiz
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Skeleton header */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded bg-white/5 animate-pulse" />
                            <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                            <div className="h-4 w-16 rounded-full bg-white/5 animate-pulse ml-auto" />
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/5 animate-pulse mb-6" />

                        {/* Skeleton question card */}
                        <div className="space-y-3 mb-6">
                            <div className="flex gap-2">
                                <div className="h-4 w-12 rounded-full bg-white/5 animate-pulse" />
                                <div className="h-4 w-14 rounded bg-white/5 animate-pulse" />
                            </div>
                            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                            <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                        </div>

                        {/* Skeleton textarea */}
                        <div className="flex-1 rounded-lg bg-white/5 animate-pulse min-h-[80px] mb-4" />

                        {/* Skeleton button */}
                        <div className="h-10 w-full rounded-lg bg-white/5 animate-pulse" />

                        <p className="text-[#555] text-[10px] text-center mt-3">Generating questions about your code...</p>
                    </>
                )}
            </div>
        );
    }

    // Results state
    if (phase === 'results') {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain size={18} className="text-emerald-400" />
                        <span className="text-sm font-bold text-white">Quiz Complete</span>
                    </div>
                    <button onClick={onExit} className="p-1 text-[#666] hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Score */}
                <div className="shrink-0 p-4 border-b border-white/10 text-center">
                    <div className="text-4xl font-black text-white mb-1">{score}/{total}</div>
                    <p className={`text-sm font-medium ${score >= total * 0.7 ? 'text-green-400' : score >= total * 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {score >= total * 0.7 ? 'Great understanding!' : score >= total * 0.4 ? 'Room for improvement' : 'You should review this code'}
                    </p>
                </div>

                {/* Results list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {results.map((r, i) => (
                        <div key={i} className={`rounded-lg border p-3 ${getRatingColor(r.rating)}`}>
                            <div className="flex items-start gap-2 mb-1">
                                {getRatingIcon(r.rating)}
                                <span className="text-xs text-[#808080]">Q{i + 1}</span>
                            </div>
                            <p className="text-xs text-white/80 mb-1">{r.question}</p>
                            <p className="text-[10px] text-[#666] italic">You: "{r.answer}"</p>
                            <p className="text-xs text-[#A0A0A0] mt-1">{r.feedback}</p>
                            {r.correctAnswer && (
                                <p className="text-xs text-emerald-400 mt-1">✓ {r.correctAnswer}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="shrink-0 p-3 border-t border-white/10 flex gap-2">
                    <button
                        onClick={() => { setResults([]); setCurrentQ(0); generateQuestions(true); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-[#808080] hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <RotateCcw size={14} /> Retry
                    </button>
                    <button
                        onClick={onExit}
                        className="flex-1 py-2 bg-emerald-500 text-black font-bold rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    // Quiz state
    const q = questions[currentQ];
    if (!q) return null;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain size={18} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">Quiz Mode</span>
                    <span className="text-[10px] text-[#666] bg-white/5 px-2 py-0.5 rounded-full">
                        Q {currentQ + 1} of {total}
                    </span>
                </div>
                <button onClick={onExit} className="p-1 text-[#666] hover:text-white transition-colors" title="Exit Quiz">
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="shrink-0 h-1 bg-white/5">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${((currentQ) / total) * 100}%` }}
                />
            </div>

            {/* Previous answers (collapsed) */}
            {results.length > 0 && (
                <div className="shrink-0 px-4 py-2 border-b border-white/5 max-h-24 overflow-y-auto">
                    {results.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 py-0.5">
                            {getRatingIcon(r.rating)}
                            <span className="text-[10px] text-[#666] truncate">Q{i + 1}: {r.question}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Current question */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty.toUpperCase()}
                        </span>
                        {q.line && (
                            <span className="text-[10px] text-[#666]">Line {q.line}</span>
                        )}
                    </div>
                    <p className="text-sm text-white leading-relaxed">{q.q}</p>
                </div>

                {/* Answer input */}
                <div className="flex-1 flex flex-col min-h-0">
                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-[#555] resize-none focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[80px]"
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                submitAnswer();
                            }
                        }}
                        autoFocus
                        disabled={evaluating}
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-xs mt-2">{error}</p>
                )}
            </div>

            {/* Submit button */}
            <div className="shrink-0 p-3 border-t border-white/10">
                <button
                    onClick={submitAnswer}
                    disabled={!answer.trim() || evaluating}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-black font-bold rounded-lg text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {evaluating ? (
                        <><Loader2 size={16} className="animate-spin" /> Evaluating...</>
                    ) : (
                        <><ArrowRight size={16} /> Submit Answer</>
                    )}
                </button>
            </div>
        </div>
    );
}
