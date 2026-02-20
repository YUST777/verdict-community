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
            // ── Phase 2: Call LLM ──────────────────────────────────
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
The "explanation" is separate from the code — put ALL explanations there, NOT as code comments.`;

            const userPrompt = `Problem:\n${problemDescription}\n\nWrite a ${isSimple ? 'simple, beginner-friendly' : 'optimal'} solution in ${language}. Return ONLY valid JSON. Remember: ZERO comments in the solution code.`;

            updateMessage(thinkMsgId, '<think>\nReading the problem...\nIdentifying constraints and edge cases...\nThinking about the approach...\n</think>');

            const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:]\/)\//g, "$1"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text().catch(() => 'Unknown error');
                throw new Error(`LLM request failed (${response.status}): ${errText}`);
            }

            const chatObj = await response.json();
            let rawContent = chatObj.choices?.[0]?.message?.content || '{}';

            // Robust JSON extraction — LLMs often wrap JSON in backticks or add extra text
            // Strip markdown code fences
            rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
            // Try to extract JSON object if there's surrounding text
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) rawContent = jsonMatch[0];

            let data: { thinking?: string; approach?: string; solution?: string; explanation?: string; concepts?: Concept[] };
            try {
                data = JSON.parse(rawContent);
            } catch (parseErr) {
                console.error('[Tutor] JSON parse error:', parseErr, 'Raw:', rawContent.substring(0, 200));
                throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
            }

            if (!data.solution) {
                throw new Error('LLM did not return a solution');
            }

            // Strip any remaining comments from the solution
            let cleanSolution = data.solution
                .replace(/\/\/.*$/gm, '')       // remove // comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* */ comments
                .replace(/^\s*\n/gm, '');          // remove resulting empty lines

            // ── Phase 3: Stream thinking ────────────────────────────
            const thinkingText = data.thinking || 'Analyzing the problem and formulating a solution.';
            const approachText = data.approach || '';
            const explanationText = data.explanation || '';

            // Stream the thinking into the collapsible drawer
            await streamTextToMessage(
                thinkMsgId,
                '<think>\n',
                thinkingText + (approachText ? '\n\n**Approach:** ' + approachText : '') + '\n</think>\n\nWriting solution...',
                20
            );

            // ── Phase 4: Stream code into editor ────────────────────
            await new Promise(r => setTimeout(r, 300));
            updateMessage(thinkMsgId,
                `<think>\n${thinkingText}${approachText ? '\n\n**Approach:** ' + approachText : ''}\n\nWriting code...\n</think>`
            );

            await streamCodeToEditor(cleanSolution);

            // ── Phase 5: Test with Judge0 ───────────────────────────
            const thinkBase = `${thinkingText}${approachText ? '\n\n**Approach:** ' + approachText : ''}`;

            updateMessage(thinkMsgId,
                `<think>\n${thinkBase}\n\nCode written successfully\n\nTesting solution against ${testCases.length} test case${testCases.length > 1 ? 's' : ''}...\n</think>`
            );

            let judgePassed = true;
            let judgeVerdict = 'Accepted';
            let judgeDetails = '';
            let judgeResultLine = '';

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
                    judgeVerdict = judgeData.verdict;
                    if (judgePassed) {
                        judgeResultLine = `**${judgeVerdict}** — All ${testCases.length} test${testCases.length > 1 ? 's' : ''} passed`;
                    } else {
                        const failedCase = judgeData.results?.find((r: any) => !r.passed);
                        judgeDetails = failedCase ? ` (Test ${failedCase.testCase}: ${failedCase.verdict})` : '';
                        judgeResultLine = `**${judgeVerdict}**${judgeDetails}`;
                    }
                } else {
                    judgePassed = false;
                    judgeVerdict = 'Judge Error';
                    judgeResultLine = `**Judge Error** — Could not reach the judge service`;
                }
            } catch (err) {
                console.error('[Tutor] Judge error:', err);
                judgePassed = false;
                judgeVerdict = 'Judge unavailable';
                judgeResultLine = `**Judge unavailable** — Could not connect to the testing service`;
            }

            // ── Phase 6: Final result — thinking chain + explanation below ───
            const finalThinkBlock = `<think>\n${thinkBase}\n\nCode written successfully\n\n${judgeResultLine}\n</think>`;

            if (judgePassed && explanationText) {
                updateMessage(thinkMsgId,
                    finalThinkBlock + `\n\n${explanationText}`
                );
            } else if (judgePassed) {
                updateMessage(thinkMsgId,
                    finalThinkBlock + `\n\nThe solution has been written to the editor and passes all test cases.`
                );
            } else {
                updateMessage(thinkMsgId,
                    finalThinkBlock + `\n\nThe solution might need adjustments. Try asking me to fix it in the chat.`
                );
            }

            // Save concepts
            if (data.concepts && data.concepts.length > 0) {
                setConcepts(data.concepts);
            }

        } catch (error: any) {
            console.error('[Tutor] Error:', error);
            updateMessage(thinkMsgId, `Something went wrong: ${error.message || 'Unknown error'}. Please try again.`);
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
