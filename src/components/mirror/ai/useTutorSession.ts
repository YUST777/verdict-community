'use client';

import { useState, useRef, useCallback } from 'react';
import { useLLM } from '@/lib/useLLM';

interface Concept {
    title: string;
    url: string;
    type: 'video' | 'article';
}

interface UseTutorSessionProps {
    problemId?: string;
    language: string;
    problemDescription?: string;
    testCases: Array<{ input: string; output: string }>;
    getHeaders: () => Record<string, string>;
    onAiCodeUpdate?: (code: string) => void;
    onSwitchToAiTab?: () => void;
    addMessage: (message: { id: string; role: 'assistant'; content: string; timestamp: Date; codeBlock?: { code: string; language: string; lineReference?: string } }) => void;
    updateMessage: (id: string, content: string) => void;
}

// ─── Simple mode banned constructs ──────────────────────────────────────
const SIMPLE_MODE_RULES = `STRICT RULES — You are generating code for a BEGINNER. Follow these rules exactly:
- Use ONLY: plain arrays (int arr[N]), basic for/while loops, if/else, basic functions
- Use cin/cout or scanf/printf for I/O
- Do NOT use: #include <vector>, #include <set>, #include <map>, #include <algorithm>, #include <queue>, #include <stack>, #include <deque>, #include <iomanip>, #include <tuple>, #include <unordered_map>, #include <unordered_set>
- Do NOT use: vector, set, map, pair, tuple, priority_queue, deque, stack, queue, multiset, multimap
- Do NOT use: sort(), min_element(), max_element(), lower_bound(), upper_bound(), accumulate(), any STL algorithm
- Do NOT use: auto keyword, range-based for loops, lambda expressions, templates
- You CAN use: #include <iostream>, #include <cstdio>, #include <cstring>, #include <cmath>, #include <cstdlib>, #include <string>
- You CAN use: basic string operations, simple math functions (abs, sqrt, pow)
- Write code a first-semester CS student would understand
- Prefer O(n²) brute force over clever O(n log n) if it works within constraints

CRITICAL: The "solution" must contain ZERO comments. No // comments, no /* */ comments, no # comments. Not a single comment anywhere. Pure code only.`;

const SMART_MODE_RULES = `Write the most optimal solution with best time/space complexity.
Use advanced algorithms, STL containers, and optimizations as needed.
Prefer O(n log n) or better. Use vector, set, map, priority_queue etc. freely.

CRITICAL: The "solution" must contain ZERO comments. No // comments, no /* */ comments, no # comments. Not a single comment anywhere. Pure code only.`;

export function useTutorSession({
    problemId,
    language,
    problemDescription,
    testCases,
    getHeaders,
    onAiCodeUpdate,
    onSwitchToAiTab,
    addMessage,
    updateMessage
}: UseTutorSessionProps) {
    const [isTutorActive, setIsTutorActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState(2);
    const tutorActiveRef = useRef(false);
    const { settings } = useLLM();

    const abortControllerRef = useRef<AbortController | null>(null);

    // ─── Stream text word-by-word into a message ────────────────────────
    const streamTextToMessage = useCallback(async (
        msgId: string,
        prefix: string,
        text: string,
        delayMs: number = 25
    ) => {
        const words = text.split(' ');
        let revealed = '';
        for (let i = 0; i < words.length; i++) {
            if (!tutorActiveRef.current) break;
            revealed += (i > 0 ? ' ' : '') + words[i];
            updateMessage(msgId, prefix + revealed);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }, [updateMessage]);

    // ─── Stream code character-by-character into the editor ──────────
    const streamCodeToEditor = useCallback(async (code: string) => {
        if (!onAiCodeUpdate) return;
        const chunkSize = 3;
        for (let i = 0; i <= code.length; i += chunkSize) {
            if (!tutorActiveRef.current) break;
            onAiCodeUpdate(code.substring(0, Math.min(i + chunkSize, code.length)));
            await new Promise(r => setTimeout(r, 12));
        }
        // Ensure full code is set
        if (tutorActiveRef.current) onAiCodeUpdate(code);
    }, [onAiCodeUpdate]);

    // ─── Main tutor flow ────────────────────────────────────────────
    const startTutor = useCallback(async () => {
        if (tutorActiveRef.current || isLoading) return;

        // Validate
        if (!testCases || testCases.length === 0) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'No test cases available for this problem. I need test cases to verify the solution.',
                timestamp: new Date()
            });
            return;
        }

        if (!settings.enabled || !settings.apiKey) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Please configure your LLM in Settings first (click the ⚙️ icon).',
                timestamp: new Date()
            });
            return;
        }

        // Abort previous fetch if running
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Reset
        setConcepts([]);
        setVariants([]);
        setSelectedLevel(2);
        setIsTutorActive(true);
        tutorActiveRef.current = true;
        setIsLoading(true);
        if (onSwitchToAiTab) onSwitchToAiTab();

        // Detect solution style
        const solutionStyle = (typeof window !== 'undefined' ? localStorage.getItem('verdict_solution_style') : 'simple') || 'simple';
        const isSimple = solutionStyle !== 'smart';
        const styleRules = isSimple ? SIMPLE_MODE_RULES : SMART_MODE_RULES;

        // ── Phase 1: Show "Reading problem..." ──────────────────────
        const thinkMsgId = `tutor-${Date.now()}`;
        addMessage({
            id: thinkMsgId,
            role: 'assistant',
            content: '<think>\nReading the problem...\n</think>',
            timestamp: new Date()
        });

        if (onAiCodeUpdate) {
            onAiCodeUpdate(`// Analyzing problem...\n// Generating ${isSimple ? 'simple' : 'optimal'} solution...`);
        }

        try {
            // ── Phase 2: Fetch reference solution FIRST ──────────────
            updateMessage(thinkMsgId, '<think>\nReading the problem...\nSearching for reference solutions...\n</think>');

            let referenceBlock = '';
            if (problemId) {
                try {
                    const [contestIdStr, problemIndex] = problemId.split('-');
                    if (contestIdStr && problemIndex) {
                        const solRes = await fetch('/api/solutions/fetch', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contestId: contestIdStr, problemIndex, language }),
                            signal
                        });
                        if (solRes.ok) {
                            const solData = await solRes.json();
                            if (solData.found && solData.code) {
                                referenceBlock = `\n\nIMPORTANT — Here is a VERIFIED ACCEPTED solution for this exact problem from a real user. Use it as your primary reference to understand the correct logic and edge-case handling. Adapt and rewrite it in your own style while ensuring correctness:\n--- REFERENCE CODE START ---\n${solData.code}\n--- REFERENCE CODE END ---`;
                            }
                        }
                    }
                } catch { /* reference fetch failed, proceed without it */ }
            }

            updateMessage(thinkMsgId, '<think>\nReading the problem...\nIdentifying constraints and edge cases...\n</think>');
            await new Promise(r => setTimeout(r, 400));

            const systemPrompt = `You are a competitive programming tutor helping a ${isSimple ? 'beginner' : 'skilled programmer'}.

${styleRules}

You MUST respond with ONLY valid JSON (no markdown, no backticks wrapping). Structure:
{
  "thinking": "Your step-by-step reasoning about the problem (2-4 sentences)",
  "approach": "Brief explanation of the approach (1-2 sentences)",
  "solution": "The complete, compilable source code as a single string WITH ABSOLUTELY ZERO COMMENTS",
  "explanation": "A clear, beginner-friendly explanation of how the solution works (3-6 sentences). Explain the key logic, what the variables represent, and the overall flow. Use markdown formatting.",
  "concepts": [{"title": "Concept Name", "url": "https://...", "type": "article"}]
}

The "solution" field must contain the FULL compilable code (with includes, main function, I/O).
The "solution" must have ZERO comments — no //, no /* */, no #comments. Pure code only.
The code must be written in ${language}.
The "explanation" is separate from the code — put ALL explanations there, NOT as code comments.
CRITICAL: Do NOT use over-engineered intermediate pruning logic (e.g., stopping if current_product > 1000) unless absolutely necessary for performance, as it often leads to wrong answers for negative numbers or large results. Use robust 64-bit integers (long long in C++) and check for exact equality at the end.${referenceBlock}`;

            const userPrompt = `Problem:\n${problemDescription}\n\nWrite a ${isSimple ? 'simple, beginner-friendly' : 'optimal'} solution in ${language}.${referenceBlock ? ' You have a verified reference solution — use it to ensure your logic is correct.' : ''} Return ONLY valid JSON. Remember: ZERO comments in the solution code.`;

            const initialMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];
            let currentMessages: any[] = [...initialMessages];

            let attempt = 0;
            const maxAttempts = isSimple ? 3 : 5;
            let finalSolution = "";
            let finalThinkingText = "";
            let finalApproachText = "";
            let finalExplanation = "";
            let judgePassed = false;
            let judgeResultLine = "";
            let data: any = {};

            updateMessage(thinkMsgId, '<think>\nReading the problem...\nIdentifying constraints and edge cases...\nThinking about the approach...\n</think>');

            while (attempt < maxAttempts) {
                attempt++;

                if (attempt > 1) {
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}\n\nTesting attempted solution... Failed.\n\nRetrying approach (Attempt ${attempt}/${maxAttempts})...\n</think>`);
                }

                const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:]\/)\//g, "$1"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${settings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: settings.model,
                        response_format: { type: "json_object" },
                        messages: currentMessages
                    }),
                    signal
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        throw new Error('You have exceeded your API rate limit or quota. Please check your AI provider billing details.');
                    }
                    const errText = await response.text().catch(() => 'Unknown error');
                    throw new Error(`LLM request failed (${response.status}): ${errText}`);
                }

                const chatObj = await response.json();
                let rawContent = chatObj.choices?.[0]?.message?.content || '{}';

                rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
                const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) rawContent = jsonMatch[0];

                try {
                    data = JSON.parse(rawContent);
                } catch (parseErr) {
                    throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
                }

                if (!data.solution) {
                    throw new Error('LLM did not return a solution');
                }

                let cleanSolution = data.solution
                    .replace(/\/\/.*$/gm, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/^\s*\n/gm, '');

                finalThinkingText = data.thinking || 'Analyzing the problem and formulating a solution.';
                finalApproachText = data.approach || '';
                finalExplanation = data.explanation || '';
                finalSolution = cleanSolution;

                const thinkBase = `${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}`;

                updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\nTesting attempted solution against Judge0 (Attempt ${attempt}/${maxAttempts})...\n</think>`);

                try {
                    const judgeResponse = await fetch('/api/judge/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sourceCode: cleanSolution,
                            language,
                            testCases: testCases.map(tc => ({
                                input: tc.input,
                                output: tc.output || ''
                            })),
                            timeLimit: 2000,
                            memoryLimit: 256
                        })
                    });

                    if (judgeResponse.ok) {
                        const judgeData = await judgeResponse.json();
                        judgePassed = judgeData.passed;
                        const judgeVerdict = judgeData.verdict;
                        if (judgePassed) {
                            judgeResultLine = `**${judgeVerdict}** — All ${testCases.length} test${testCases.length > 1 ? 's' : ''} passed`;
                        } else {
                            const failedCase = judgeData.results?.find((r: any) => !r.passed);
                            let judgeDetails = failedCase ? ` (Test ${failedCase.testCase}: ${failedCase.verdict})` : '';
                            judgeResultLine = `**${judgeVerdict}**${judgeDetails}`;
                        }
                    } else {
                        judgePassed = false;
                        judgeResultLine = `**Judge Error** — Could not reach the judge service`;
                    }
                } catch (err) {
                    judgePassed = false;
                    judgeResultLine = `**Judge unavailable** — Could not connect to the testing service`;
                }

                if (judgePassed || attempt === maxAttempts) {
                    break;
                } else {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your solution failed the tests. Judge verdict: ${judgeResultLine}. Please fix the logical errors, edge cases, or syntax errors, and try again. Return ONLY valid JSON with the exact same structure.`
                    });
                }
            }



            // ── Phase 3: Stream thinking ────────────────────────────
            await streamTextToMessage(
                thinkMsgId,
                '<think>\n',
                finalThinkingText + (finalApproachText ? '\n\n**Approach:** ' + finalApproachText : '') + '\n</think>\n\nWriting solution...',
                20
            );

            // ── Phase 4: Stream code into editor ────────────────────
            await new Promise(r => setTimeout(r, 300));
            updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}\n\nWriting code...\n</think>`);

            await streamCodeToEditor(finalSolution);

            // ── Phase 5: Final Result ───────────────────────────────
            const thinkBase = `${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}`;
            const finalThinkBlock = `<think>\n${thinkBase}\n\nCode written successfully\n\n${judgeResultLine}\n</think>`;

            if (judgePassed) {
                updateMessage(thinkMsgId, finalThinkBlock + `\n\n${finalExplanation}\n\nThe solution has been written to the editor and passes all test cases.`);
            } else {
                updateMessage(thinkMsgId, finalThinkBlock + `\n\n${finalExplanation}\n\nThe solution might need adjustments. Try asking me to fix it in the chat.`);
            }

            // Save concepts & inject real youtube video dynamically
            let finalConcepts = data.concepts || [];
            try {
                const searchQ = finalConcepts[0]?.title ? `${finalConcepts[0].title} algorithm tutorial` : "competitive programming tutorial";
                const ytRes = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQ })
                });
                if (ytRes.ok) {
                    const ytData = await ytRes.json();
                    const ytVideo = ytData.results?.find((r: any) => r.type === 'youtube');
                    if (ytVideo) {
                        finalConcepts = [
                            {
                                title: ytVideo.title,
                                type: 'video' as any,
                                url: ytVideo.url
                            },
                            ...finalConcepts
                        ];
                    }
                }
            } catch (e) {
                console.error('[Tutor] Failed to fetch youtube concept', e);
            }

            if (finalConcepts.length > 0) {
                setConcepts(finalConcepts);
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                updateMessage(thinkMsgId, `Tutor session was stopped.`);
            } else {
                console.error('[Tutor] Error:', error);
                updateMessage(thinkMsgId, `Something went wrong: ${error.message || 'Unknown error'}. Please try again.`);
            }
            setIsTutorActive(false);
            tutorActiveRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, problemDescription, language, testCases, settings, onSwitchToAiTab, onAiCodeUpdate, addMessage, updateMessage, streamTextToMessage, streamCodeToEditor]);

    const changeLevel = useCallback(async (level: number) => {
        setSelectedLevel(level);
    }, []);

    const stopTutor = useCallback(() => {
        tutorActiveRef.current = false;
        setIsTutorActive(false);
        setIsLoading(false);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    return {
        isTutorActive,
        isLoading,
        concepts,
        variants,
        selectedLevel,
        changeLevel,
        startTutor,
        stopTutor
    };
}
