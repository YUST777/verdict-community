'use client';

import { useState, useRef, useCallback } from 'react';
import { useLLM } from '@/lib/useLLM';
import { extractAndParseJson } from '@/lib/json-utils';
import { VideoScript } from '../video';

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
    addMessage: (message: any, tabId?: string) => void;
    updateMessage: (id: string, content: string, videoScript?: VideoScript, tabId?: string) => void;
    setConcepts: (concepts: Concept[] | ((prev: Concept[]) => Concept[]), tabId?: string) => void;
    setIsTutorActive: (active: boolean, tabId?: string) => void;
    setIsLoading: (loading: boolean, tabId?: string) => void;
}

// ─── Simple mode banned constructs ──────────────────────────────────────
const SIMPLE_MODE_RULES = `STRICT RULES — Use an ADAPTIVE TEACHING approach for this learner:
1. **Easy Problems** (Rating < 1400 or basic concepts): Use ONLY plain arrays (int arr[N]), basic loops (for/while), if/else, and standard variables. Avoid STL containers like vector/map to keep it as simple as possible.
2. **Hard Problems** (Rating >= 1400 or complex constraints): You ARE authorized and encouraged to use "all weapons" necessary (e.g., #include <vector>, <map>, <set>, <queue>, <stack>, <algorithm>) to ensure the solution is both CORRECT and EFFICIENT.
3. **Correctness First**: Passing the judge is the highest priority. If a beginner-style O(n²) solution is logically impossible or will TLE/fail, do NOT write it. Use the optimal O(n log n) or advanced algorithm instead, and explain the advanced tools clearly in the "explanation" field.
4. **Strict C++ Syntax**: ALWAYS remember semicolons after struct and class definitions (e.g., struct S { ... };). Failure to do so causes compilation errors.
5. **Style**: Use standard global arrays for large datasets (e.g., int a[100005]) to mimic common competitive programming patterns. Use robust 64-bit integers (long long) for large values.
6. **JSON Format**: Return ONLY valid JSON. Return the "solution" key FIRST to ensure it is generated before token limits are hit.

CRITICAL: The "solution" must contain ZERO comments. No // comments, no /* */ comments, no # comments. Not a single comment anywhere. Pure code only.`;

const SMART_MODE_RULES = `STRICT RULES — Use an EXPERT TEACHING approach:
1. **Optimal Solutions**: Write the most optimal solution with best time/space complexity. Use advanced algorithms, STL containers (vector, map, priority_queue, etc.) freely.
2. **Correctness First**: Passing the judge is the highest priority. Ensure no intermediate overflow or precision issues.
3. **Strict C++ Syntax**: ALWAYS remember semicolons after struct and class definitions (e.g., struct S { ... };). Failure to do so causes compilation errors.
4. **Style**: Use standard competitive programming style. Use 64-bit integers (long long) for safety.
5. **JSON Format**: Return ONLY valid JSON. Return the "solution" key FIRST to avoid token truncation mid-code.

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
    updateMessage,
    setConcepts,
    setIsTutorActive,
    setIsLoading: setIsLoadingInParent
}: UseTutorSessionProps) {
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState(2);
    // Maps tab ID to active status/abort controller
    const tutorActiveRefs = useRef<Record<string, boolean>>({});
    const abortControllers = useRef<Record<string, AbortController | null>>({});
    const { settings } = useLLM();

    // ─── Stream text word-by-word into a message ────────────────────────
    const streamTextToMessage = useCallback(async (
        msgId: string,
        prefix: string,
        text: string,
        tabId: string,
        delayMs: number = 25
    ) => {
        const words = text.split(' ');
        let revealed = '';
        for (let i = 0; i < words.length; i++) {
            if (!tutorActiveRefs.current[tabId]) break;
            revealed += (i > 0 ? ' ' : '') + words[i];
            updateMessage(msgId, prefix + revealed, undefined, tabId);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }, [updateMessage]);

    // ─── Stream code character-by-character into the editor ──────────
    const streamCodeToEditor = useCallback(async (code: string, tabId: string) => {
        if (!onAiCodeUpdate) return;
        const chunkSize = 3;
        for (let i = 0; i <= code.length; i += chunkSize) {
            if (!tutorActiveRefs.current[tabId]) break;
            onAiCodeUpdate(code.substring(0, Math.min(i + chunkSize, code.length)));
            await new Promise(r => setTimeout(r, 12));
        }
        // Ensure full code is set
        if (tutorActiveRefs.current[tabId]) onAiCodeUpdate(code);
    }, [onAiCodeUpdate]);

    // ─── Main tutor flow ────────────────────────────────────────────
    const startTutor = useCallback(async (tabId: string = 'default') => {
        if (tutorActiveRefs.current[tabId]) {
            console.warn(`[Tutor] Tab ${tabId} already has an active tutor session.`);
            return;
        }

        // Validate
        if (!testCases || testCases.length === 0) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'No test cases available for this problem. I need test cases to verify the solution.',
                timestamp: new Date()
            }, tabId);
            return;
        }

        if (!settings.enabled || !settings.apiKey) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Please configure your LLM in Settings first (click the ⚙️ icon).',
                timestamp: new Date()
            }, tabId);
            return;
        }

        // Abort previous fetch for this tab if running
        if (abortControllers.current[tabId]) {
            abortControllers.current[tabId]?.abort();
        }
        abortControllers.current[tabId] = new AbortController();
        const signal = abortControllers.current[tabId]?.signal;

        // Reset state for this tab
        setConcepts([], tabId);
        setVariants([]);
        setSelectedLevel(2);
        setIsTutorActive(true, tabId);
        tutorActiveRefs.current[tabId] = true;
        setIsLoadingInParent(true, tabId);
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
            content: '<think>\nReading the problem...\n</think>\n\n🍳 *Getting ready to cook...*',
            timestamp: new Date()
        }, tabId);

        if (onAiCodeUpdate) {
            onAiCodeUpdate(`// Analyzing problem...\n// Generating ${isSimple ? 'simple' : 'optimal'} solution...`);
        }

        try {
            // ── Phase 2: Fetch reference solution FIRST ──────────────
            let referenceBlock = '';
            let referenceCode = '';
            let referenceStatus = 'No archived solution found. I will solve this from scratch.';
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
                                referenceCode = solData.code;
                                referenceBlock = `\n\nIMPORTANT — Here is a VERIFIED ACCEPTED solution for this exact problem from a real user. Use it as your primary reference to understand the correct logic and edge-case handling. Adapt and rewrite it in your own style while ensuring correctness:\n--- REFERENCE CODE START ---\n${referenceCode}\n--- REFERENCE CODE END ---`;
                                referenceStatus = 'Verified reference solution found! Using it for guidance...';
                            }
                        }
                    }
                } catch { /* reference fetch failed, proceed without it */ }
            }

            const isArabic = settings.language === 'ar';
            const languageInstruction = isArabic
                ? '\n\nIMPORTANT LANGUAGE RULE: You MUST write ALL explanations, thinking, approach, and concepts in Arabic (العربية). Use natural Arabic (Egyptian/tech dialect is fine). The "solution" code itself stays in the programming language (C++/etc), but the "explanation" and "thinking" fields MUST be in Arabic.'
                : '';

            updateMessage(thinkMsgId, `<think>\nReading the problem...\n${referenceStatus}\nIdentifying constraints and edge cases...\n</think>\n\n*${isArabic ? 'بقرا المسألة وبجهز المكونات...' : 'Reading the problem and gathering ingredients...'}*`, undefined, tabId);
            await new Promise(r => setTimeout(r, 400));

            const systemPrompt = `You are an elite competitive programming tutor helping a ${isSimple ? 'beginner' : 'skilled programmer'}. You are passionate, slightly quirky, and love 'cooking up' brilliant solutions. You have a lot of 'soul' and personality.

${styleRules}

You MUST respond with ONLY valid JSON (no markdown, no backticks wrapping). You have TWO options depending on the problem type:

**OPTION 1: Standard Solution (Use this 95% of the time)**
If the algorithm is clear or you are confident in your logic, return the full solution:
{
  "thinking": "A strictly technical, straightforward, and concise analysis. Detail the core algorithm, time and space complexity, and specific edge case considerations (e.g., negative integers, large inputs, empty sets). Omit all conversational filler, personality, or metaphors. Focus purely on engineering logic.",
  "solution": "The complete, compilable source code as a single string WITH ABSOLUTELY ZERO COMMENTS. MUST be valid C++ with semicolons after structs/classes.",
  "approach": "Brief explanation of the approach (1-2 sentences).",
  "explanation": "A conversational explanation directed at the user outside the thinking block. Start with an engaging intro (e.g., 'Alright, let's cook up this solution!' or something similar), explain the core logic clearly, and talk about how it works.",
  "concepts": [{"title": "Concept Name", "url": "https://...", "type": "article"}]
}

**OPTION 2: Python REPL (Pattern Finder)**
If the problem involves complex number theory, combinatorics, or observing a mathematical sequence, you MAY use a Python scratchpad to empirically test small inputs to find a pattern or formula BEFORE writing C++ code. Return ONLY:
{
  "python_scratchpad": "def brute_force(): ...\\nfor i in range(1, 15): print(brute_force(i))",
  "thinking": "I need to observe the first 15 terms of this sequence to find a mathematical formula before writing the C++ solution..."
}
If you choose Option 2, I will execute your Python script and return the exact output to you. You can then use that mathematical insight to provide the final Option 1 JSON. Only use this if you legitimately need to test a math hypothesis.

The "solution" field (in Option 1) must contain the FULL compilable code (with includes, main function, I/O).
The "solution" must have ZERO comments — no //, no /* */, no #comments. Pure code only.
The code must be written in ${language}.
The "explanation" is separate from the code — put ALL explanations there, NOT as code comments.
CRITICAL: Do NOT use over-engineered intermediate pruning logic (e.g., stopping if current_product > 1000) unless absolutely necessary for performance, as it often leads to wrong answers for negative numbers or large results. Use robust 64-bit integers (long long in C++) and check for exact equality at the end.

REFERENCE SOLUTION GUIDANCE: If a verified reference solution is provided, you MUST maintain its algorithmic complexity. If the reference is O(n log n), do NOT downgrade to O(n²) even in "simple" mode, as it will likely fail for large inputs. Adapt the reference solution's core logic into your style while ensuring it remains highly efficient.

SPECIAL INSTRUCTION FOR MULTIPLE SOLUTIONS: If the problem allows multiple valid answers (e.g., "output any solution"), you MUST still prioritize matching the exact values provided in the example cases. This ensures you pass the strict judge checker. ${referenceBlock}${languageInstruction}`;

            const userPrompt = `Problem:\n${problemDescription}\n\nWrite a ${isSimple ? 'simple, beginner-friendly' : 'optimal'} solution in ${language}.${referenceBlock ? ' You have a verified reference solution — use it to ensure your logic is correct.' : ''} Return ONLY valid JSON. Remember: ZERO comments in the solution code.`;

            const initialMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];
            let currentMessages: any[] = [...initialMessages];

            let attempt = 0;
            let scratchpadCount = 0;
            const maxAttempts = isSimple ? 3 : 5;
            let finalSolution = "";
            let finalThinkingText = "";
            let finalApproachText = "";
            let finalExplanation = "";
            let judgePassed = false;
            let judgeResultLine = "";
            let data: any = {};

            updateMessage(thinkMsgId, `<think>\nReading the problem...\n${referenceStatus}\nIdentifying constraints and edge cases...\nThinking about the approach...\n</think>\n\n🤔 *Thinking about the approach...*`, undefined, tabId);

            while (attempt < maxAttempts) {
                attempt++;

                if (attempt > 1) {
                    const passCount = data.passCount || 0;
                    const totalCount = testCases.length;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}\n\nTesting attempted solution... Failed (${passCount}/${totalCount} tests passed).\n\nRetrying approach (Attempt ${attempt}/${maxAttempts})...\n</think>\n\n*${isArabic ? `بصلح الأخطاء (نجح ${passCount}/${totalCount}). بشتغل على حل...` : `Debugging failing tests (Passed ${passCount}/${totalCount}). Working on a fix...`}*`, undefined, tabId);
                }

                const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:])\/\/+/g, "$1/"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${settings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: settings.model,
                        response_format: { type: "json_object" },
                        max_tokens: 4096,
                        messages: currentMessages,
                        stream: true
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

                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');
                let rawContent = '';
                let finishReason = null;

                let buffer = '';
                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || '';
                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

                            if (trimmedLine.startsWith('data: ')) {
                                try {
                                    const parsedChunk = JSON.parse(trimmedLine.slice(6));
                                    const delta = parsedChunk.choices?.[0]?.delta?.content || parsedChunk.choices?.[0]?.message?.content || '';
                                    if (delta) {
                                        rawContent += delta;
                                        // Dynamically stream "thinking" field value
                                        const thinkMatch = rawContent.match(/"thinking"\s*:\s*"((?:[^"\\\\]|\\.)*)/);
                                        if (thinkMatch && thinkMatch[1]) {
                                            const partialThink = thinkMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                            updateMessage(thinkMsgId, `<think>\n${partialThink}\n</think>\n\n🤔 *Thinking...*`, undefined, tabId);
                                        }
                                    }
                                    if (parsedChunk.choices?.[0]?.finish_reason) {
                                        finishReason = parsedChunk.choices[0].finish_reason;
                                    }
                                } catch (e) {
                                    console.warn('[SSE] Failed to parse chunk:', trimmedLine, e);
                                }
                            }
                        }
                    }
                    // ── FALLBACK: Handle non-streamed (one-shot) JSON response ──────
                    if (!rawContent && buffer.trim().startsWith('{')) {
                        try {
                            const fullObj = JSON.parse(buffer.trim());
                            const messageContent = fullObj.choices?.[0]?.message?.content || fullObj.choices?.[0]?.delta?.content || fullObj.message?.content || fullObj.content || '';
                            if (messageContent) {
                                rawContent = messageContent;
                                if (fullObj.choices?.[0]?.finish_reason) {
                                    finishReason = fullObj.choices[0].finish_reason;
                                }
                            } else {
                                console.warn('[SSE] Fallback triggered but no content found in JSON:', fullObj);
                            }
                        } catch (e) {
                            console.warn('[SSE] Fallback parse failed:', e);
                        }
                    }
                }
                console.log('[SSE] Stream ended. Total rawContent length:', rawContent.length);
                console.log('[SSE] Buffer state snapshot:', buffer.slice(0, 100) + (buffer.length > 100 ? '...' : ''));


                if (finishReason === 'length' || finishReason === 'max_tokens') {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response was cut off because you hit the maximum token limit. Your "thinking" section was too long, preventing you from finishing the solution. Please try again. Keep your "thinking" strictly under 250 words so you have space to write the full C++ solution.`
                    });
                    const latestThink = "Error: Hit maximum token limit. The output was cut off mid-sentence. Retrying with a more concise thought process...";
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- Fixing Attempt ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *Ran out of tokens. Retrying more concisely...*`, undefined, tabId);
                    continue;
                }

                if (!rawContent) {
                    throw new Error('The AI provided an empty response. This can happen if the AI provider is experiencing high latency or if the request was blocked.');
                }

                try {
                    data = extractAndParseJson(rawContent);
                } catch (parseErr: any) {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response was invalid JSON or truncated: ${parseErr.message}. Please try again and ensure you close all JSON brackets and provide the full solution. Keep your thinking concise if you ran out of tokens.`
                    });
                    const latestThink = "Error parsing response: " + parseErr.message;
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- Fixing Attempt ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *JSON Truncated. Retrying...*`, undefined, tabId);
                    continue;
                }

                // ─── Handle Python Scratchpad (Option 2) ────────────────
                if (data.python_scratchpad && !data.solution) {
                    scratchpadCount++;
                    if (scratchpadCount > 3) {
                        currentMessages.push({ role: 'assistant', content: rawContent });
                        currentMessages.push({
                            role: 'user',
                            content: `You have reached the maximum number of Python Scratchpad executions (3) for this problem. You MUST now proceed with the final Option 1 JSON schema and provide your C++ solution.`
                        });
                        const latestThink = "Error: Maximum scratchpad limit reached. Retrying with final C++ solution...";
                        finalThinkingText += `\n\n**-- Max Scratchpads Reached --**\n` + latestThink;
                        updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *Scratchpad limit reached. Proceeding with solution...*`, undefined, tabId);
                        attempt--; // Do not count scratchpad limit bump as a code attempt
                        continue;
                    }

                    const scratchpadThink = data.thinking || 'Using Python scratchpad to find a pattern...';
                    finalThinkingText += (attempt === 1 && scratchpadCount === 1 ? '' : '\n\n') + scratchpadThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n🐍 *Running Python scratchpad on local Judge0 to find a pattern...*`, undefined, tabId);

                    try {
                        const scratchRes = await fetch('/api/judge/test', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sourceCode: data.python_scratchpad,
                                language: 'python',
                                testCases: [{ input: '', output: '' }],
                                timeLimit: 5000,
                                memoryLimit: 256
                            }),
                            signal
                        });

                        let scratchOutput = "No output";
                        if (scratchRes.ok) {
                            const scratchData = await scratchRes.json();
                            const resObj = scratchData.results?.[0] || {};
                            scratchOutput = (resObj.stdout || resObj.stderr || resObj.compile_output || "No output").trim();
                        } else {
                            scratchOutput = "Execution failed due to server error.";
                        }

                        currentMessages.push({ role: 'assistant', content: rawContent });
                        currentMessages.push({
                            role: 'user',
                            content: `Your Python scratchpad executed successfully. Output:\n\n${scratchOutput}\n\nPlease use this insight to write the final optimal C++ solution using the Option 1 standard JSON schema.`
                        });
                    } catch (e: any) {
                        currentMessages.push({ role: 'assistant', content: rawContent });
                        currentMessages.push({
                            role: 'user',
                            content: `Your Python scratchpad encountered an error communicating with the judge system. Please proceed with Option 1 based on your best theoretical logic.`
                        });
                    }
                    attempt--; // Do not count scratchpad against max attempts
                    continue;
                }

                if (!data.solution || typeof data.solution !== 'string') {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response did not include a valid "solution" string field, or it was truncated. Please provide the final JSON with the "solution" code formatted strictly as a single string. Keep your thinking concise if you ran out of tokens.`
                    });
                    const latestThink = "Error: Invalid or missing solution field. Retrying...";
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- Fixing Attempt ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *Invalid solution format. Retrying...*`, undefined, tabId);
                    continue;
                }

                let cleanSolution = data.solution
                    .replace(/\/\/.*$/gm, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/^\s*\n/gm, '');

                const latestThink = data.thinking || 'Analyzing the problem and formulating a solution.';
                if (attempt === 1) {
                    finalThinkingText = latestThink;
                } else {
                    finalThinkingText += `\n\n**-- Fixing Attempt ${attempt} --**\n` + latestThink;
                }

                finalApproachText = data.approach || '';
                finalExplanation = data.explanation || '';
                finalSolution = cleanSolution;

                const thinkBase = `${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}`;

                updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\nTesting attempted solution against Judge0 (Attempt ${attempt}/${maxAttempts})...\n</think>\n\n⚙️ *Testing solution against Judge0 test cases (Attempt ${attempt}/${maxAttempts})...*`, undefined, tabId);

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
                            timeLimit: 5000,
                            memoryLimit: 256
                        }),
                        signal
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

                            // Feed rich error output back to AI context
                            if (failedCase?.compileError) {
                                judgeDetails += `\n\nCompiler Output:\n${failedCase.compileError.substring(0, 1000)}`;
                            } else if (failedCase?.runtimeError) {
                                judgeDetails += `\n\nRuntime Error Output:\n${failedCase.runtimeError.substring(0, 1000)}`;
                            }

                            judgeResultLine = `**${judgeVerdict}**${judgeDetails}`;
                            data.passCount = judgeData.passedCount;
                        }
                    } else {
                        judgePassed = false;
                        judgeResultLine = `**Judge Error** — Could not reach the judge service`;
                    }
                } catch (err) {
                    judgePassed = false;
                    judgeResultLine = `**Judge unavailable** — Could not connect to the testing service`;
                }

                if (judgePassed && referenceCode && finalSolution && attempt < maxAttempts) {
                    updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\nTesting attempted solution against Judge0 (Attempt ${attempt}/${maxAttempts})... Passed sample tests!\n\nGenerating 5 tricky edge cases for stress-testing...\n</think>\n\n🕵️ *Wait, I'm not done! Stress-testing my solution against hidden edge cases...*`, undefined, tabId);

                    try {
                        const edgeCasePrompt = `Your solution passed the basic examples! Now, imagine you are a competitive programming judge trying to break your own code. Generate exactly 5 tricky edge-case inputs for this problem (e.g., minimum/maximum constraints, all elements equal, n=1, empty arrays if allowed, etc.).
                        Return ONLY a JSON object containing an "inputs" array of 5 strings. Each string must be the exact text that would be passed to standard input (stdin). No markdown, no explanations. Example: { "inputs": ["1\\n1\\n", "10\\n1 2 3 4 5 6 7 8 9 10\\n"] }`;

                        const edgeRes = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:])\/\/+/g, "$1/"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${settings.apiKey}`
                            },
                            body: JSON.stringify({
                                model: settings.model,
                                response_format: { type: "json_object" },
                                messages: [
                                    { role: 'system', content: 'You are a strict test case generator. Return ONLY {"inputs": ["input1", "input2", ...]}' },
                                    { role: 'user', content: edgeCasePrompt }
                                ]
                            }),
                            signal
                        });

                        if (edgeRes.ok) {
                            const edgeData = await edgeRes.json();
                            const edgeContent = edgeData.choices?.[0]?.message?.content || '{}';
                            const edgeObj = extractAndParseJson(edgeContent);
                            if (edgeObj && edgeObj.inputs && Array.isArray(edgeObj.inputs)) {
                                updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\nTesting attempted solution against Judge0 (Attempt ${attempt}/${maxAttempts})... Passed sample tests!\n\nGenerated 5 edge cases. Fuzzing against verified reference solution...\n</think>\n\n🏎️ *Fuzzing my code against the verified solution with 5 hidden test cases...*`, undefined, tabId);

                                const fuzzRes = await fetch('/api/judge/fuzz', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        aiSolution: finalSolution,
                                        referenceSolution: referenceCode,
                                        language: language,
                                        edgeCases: edgeObj.inputs
                                    }),
                                    signal
                                });

                                if (fuzzRes.ok) {
                                    const fuzzData = await fuzzRes.json();
                                    if (!fuzzData.passed && fuzzData.failingCase) {
                                        judgePassed = false;
                                        judgeResultLine = `**Wrong Answer on hidden edge case** — Mismatch with verified solution`;
                                        data.passCount = testCases.length; // Passed samples, but failed fuzz

                                        currentMessages.push({ role: 'assistant', content: rawContent });
                                        currentMessages.push({
                                            role: 'user',
                                            content: `Your solution passed the sample tests, but failed on a generated edge case during stress-testing against the verified reference solution.\n\n**Input:**\n${fuzzData.failingCase.input}\n\n**Expected Output (from verified reference):**\n${fuzzData.failingCase.expected}\n\n**Your Output:**\n${fuzzData.failingCase.actual}\n\nPlease fix the logical error. Return ONLY valid JSON with the exact same structure.`
                                        });
                                        continue; // Proceed to the next attempt to fix the edge case
                                    }
                                }
                            }
                        }
                    } catch (e) { console.error('[Fuzzer] Err:', e); }
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
            // The thinking stream has already been rendered natively during the SSE loop.
            // But we will re-render the final compiled thinking + approach block cleanly here.
            updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}\n</think>\n\nWriting solution...`, undefined, tabId);

            // ── Phase 4: Stream code into editor ────────────────────
            await new Promise(r => setTimeout(r, 300));
            updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}\n\nWriting code...\n</think>\n\n*${isArabic ? 'بكتب الكود في المحرر...' : 'Writing solution code to editor...'}*`, undefined, tabId);

            await streamCodeToEditor(finalSolution, tabId);

            // ── Phase 5: Final Result ───────────────────────────────
            const thinkBaseFinal = `${finalThinkingText}${finalApproachText ? '\n\n**Approach:** ' + finalApproachText : ''}`;
            const finalThinkBlock = `<think>\n${thinkBaseFinal}\n\nCode written successfully\n\n${judgeResultLine}\n</think>`;

            if (judgePassed) {
                updateMessage(thinkMsgId, finalThinkBlock + `\n\n${finalExplanation}\n\n${isArabic ? 'الحل اتكتب في المحرر ونجح في كل التيستات.\n\n**عايز شرح أعمق؟** أقدر أعملك فيديو يشرحلك الحل سطر بسطر!' : 'The solution has been written to the editor and passes all test cases.\n\n**Want a deeper breakdown?** I can generate a video walkthrough for this solution if you\'d like!'}`, undefined, tabId);
            } else {
                updateMessage(thinkMsgId, finalThinkBlock + `\n\n${finalExplanation}\n\nThe solution might need adjustments. Try asking me to fix it in the chat.`, undefined, tabId);
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
                setConcepts(finalConcepts, tabId);
            }

        } catch (err: any) {
            if (err.name === 'AbortError') {
                updateMessage(thinkMsgId, `Tutor session was stopped.`, undefined, tabId);
            } else {
                console.error('[Tutor Error]', err);
                setIsLoadingInParent(false, tabId);
                setIsTutorActive(false, tabId);
                addMessage({
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: `${settings.language === 'ar' ? 'حصل خطأ' : 'Error'}: ${err.message || (settings.language === 'ar' ? 'فشل في إنشاء الحل' : 'Failed to generate solution')}. ${settings.language === 'ar' ? 'حاول تاني.' : 'Please try again.'}`,
                    timestamp: new Date()
                }, tabId);
            }
        } finally {
            setIsLoadingInParent(false, tabId);
            setIsTutorActive(false, tabId);
            tutorActiveRefs.current[tabId] = false;
        }
    }, [problemId, language, problemDescription, testCases, settings, getHeaders, onAiCodeUpdate, onSwitchToAiTab, addMessage, updateMessage, setConcepts, setIsTutorActive, streamCodeToEditor, setIsLoadingInParent, streamTextToMessage]);

    const changeLevel = useCallback(async (level: number) => {
        setSelectedLevel(level);
    }, []);

    const stopTutor = useCallback((tabId?: string) => {
        if (tabId) {
            tutorActiveRefs.current[tabId] = false;
            setIsTutorActive(false, tabId);
            setIsLoadingInParent(false, tabId);
            if (abortControllers.current[tabId]) {
                abortControllers.current[tabId]?.abort();
                abortControllers.current[tabId] = null;
            }
        } else {
            // Stop all tabs
            Object.keys(tutorActiveRefs.current).forEach(id => {
                tutorActiveRefs.current[id] = false;
                setIsTutorActive(false, id);
                setIsLoadingInParent(false, id);
                if (abortControllers.current[id]) {
                    abortControllers.current[id]?.abort();
                    abortControllers.current[id] = null;
                }
            });
        }
    }, [setIsTutorActive, setIsLoadingInParent]);

    const startVideoTutor = useCallback(async (currentSolution?: string, tabId: string = 'default') => {
        // Abort previous video tutor if running for this tab
        if (abortControllers.current[tabId]) {
            abortControllers.current[tabId]?.abort();
        }
        abortControllers.current[tabId] = new AbortController();
        const signal = abortControllers.current[tabId]?.signal;

        setIsLoadingInParent(true, tabId);
        if (onSwitchToAiTab) onSwitchToAiTab();

        const videoMsgId = `video-tutor-${Date.now()}`;
        addMessage({
            id: videoMsgId,
            role: 'assistant',
            content: `<think>\nAnalyzing problem and searching for best solution...\n</think>\n\n*${settings.language === 'ar' ? 'بدور على أحسن طريقة أشرحلك بيها...' : 'Searching for the best way to explain this...'}*`,
            timestamp: new Date()
        }, tabId);

        try {
            let solutionToExplain = currentSolution || '';

            // If no solution provided, try to find one in the DB (archived)
            if (!solutionToExplain && problemId) {
                updateMessage(videoMsgId, `<think>\nNo local code found. Searching for a verified solution in our archives...\n</think>\n\n*${settings.language === 'ar' ? 'بدور على حل متحقق منه...' : 'Searching for a verified solution to explain...'}*`, undefined, tabId);
                try {
                    const [contestIdStr, problemIndex] = problemId.split('-');
                    const solRes = await fetch('/api/solutions/fetch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contestId: contestIdStr, problemIndex, language }),
                        signal
                    });
                    if (solRes.ok) {
                        const solData = await solRes.json();
                        if (solData.found && solData.code) {
                            solutionToExplain = solData.code;
                            updateMessage(videoMsgId, `<think>\nVerified solution found in archives! Proceeding to video generation...\n</think>\n\n*${settings.language === 'ar' ? 'لقيت حل متحقق منه! بجهز الفيديو...' : 'Found a verified solution! Crafting your video walkthrough...'}*`, undefined, tabId);
                        }
                    }
                } catch (e) {
                    console.warn('[Video Tutor] Solution discovery failed', e);
                }
            }

            // If still no solution, we MUST generate one first (just like teach me flow)
            if (!solutionToExplain) {
                updateMessage(videoMsgId, `<think>\nNo solution found. I need to solve the problem first to explain it accurately.\n</think>\n\n*${settings.language === 'ar' ? 'مفيش حل. بحل المسألة الأول عشان أقدر أشرحها...' : 'No solution found. Solving the problem first so I can explain it...'}*`, undefined, tabId);
                // Note: Normally we'd call startTutor here, but for simplicity we'll tell the user to use Teach Me or provide code.
                updateMessage(videoMsgId, settings.language === 'ar' ? 'ملقيتش حل أشرحه. جرب **علمني** الأول عشان يتعمل حل، وبعدين أقدر أعملك فيديو!' : `I couldn't find a solution to explain. Try using **Teach Me** first to generate a solution, then I can walk you through it with a video!`, undefined, tabId);
                setIsLoadingInParent(false, tabId);
                return;
            }

            // Phase 2: Call the Video API
            updateMessage(videoMsgId, `<think>\nSolution confirmed. Calling Video Generation API...\nBreaking down code into scenes...\nAdding meticulous line-by-line narration...\n</think>\n\n*${settings.language === 'ar' ? 'بجهز الفيديو... ممكن ياخد ثواني.' : 'Crafting your video walkthrough... This might take a few seconds.'}*`, undefined, tabId);

            const response = await fetch('/api/ai/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemDescription,
                    solution: solutionToExplain,
                    language,
                    settings
                }),
                signal
            });

            if (response.ok) {
                const scriptData = await response.json();

                // We update the message with the video script data
                updateMessage(videoMsgId, settings.language === 'ar' ? '**الفيديو جاهز!** شوف الشرح سطر بسطر تحت:' : '**Video walkthrough ready!** Watch the line-by-line breakdown below:', scriptData, tabId);
            } else {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate video script');
            }

        } catch (err: any) {
            if (err.name === 'AbortError') {
                updateMessage(videoMsgId, `Video generation was cancelled.`, undefined, tabId);
            } else {
                console.error('[Video Tutor Error]', err);
                updateMessage(videoMsgId, `⚠️ Sorry, I failed to generate the video: ${err.message}`, undefined, tabId);
            }
        } finally {
            setIsLoadingInParent(false, tabId);
            abortControllers.current[tabId] = null;
        }
    }, [problemId, language, problemDescription, settings, addMessage, updateMessage, onSwitchToAiTab, setIsLoadingInParent]);

    return {
        variants,
        selectedLevel,
        changeLevel,
        startTutor,
        stopTutor,
        startVideoTutor
    };
}
