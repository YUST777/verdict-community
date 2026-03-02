'use client';

import { useState, useRef, useCallback } from 'react';
import { useLLM } from '@/lib/useLLM';
import { extractAndParseJson } from '@/lib/json-utils';
import { CODE_TUTOR_PEDAGOGY } from '@/lib/ai-code-tutor-instructions';

interface Concept {
    title: string;
    url: string;
    type: 'video' | 'article';
}

interface TutorResponseData {
    thinking?: string;
    solution?: string;
    approach?: string;
    explanation?: string;
    concepts?: Concept[];
    python_scratchpad?: string;
    passCount?: number;
}

interface UseTutorProps {
    problemId?: string;
    language: string;
    problemDescription?: string;
    testCases: Array<{ input: string; output: string }>;
    getHeaders: () => Record<string, string>;
    onAiCodeUpdate?: (code: string) => void;
    onSwitchToAiTab?: () => void;
    addMessage: (message: any, tabId?: string) => void;
    updateMessage: (id: string, content: string, videoScript?: any, tabId?: string) => void;
    setConcepts: (concepts: Concept[] | ((prev: Concept[]) => Concept[]), tabId?: string) => void;
    setIsTutorActive: (active: boolean, tabId?: string) => void;
    setIsLoading: (loading: boolean, tabId?: string) => void;
}

const SIMPLE_MODE_RULES = `STRICT RULES — Use an ADAPTIVE TEACHING approach for this learner:
1. **Easy Problems** (Rating < 1400 or basic concepts): Use ONLY plain arrays (int arr[N]), basic loops (for/while), if/else, and standard variables. Avoid STL containers like vector/map to keep it as simple as possible.
2. **Hard Problems** (Rating >= 1400 or complex constraints): You ARE authorized and encouraged to use "all weapons" necessary (e.g., #include <vector>, <map>, <set>, <queue>, <stack>, <algorithm>) to ensure the solution is both CORRECT and EFFICIENT.
3. **Correctness First**: Passing the judge is the highest priority. If a beginner-style O(n²) solution is logically impossible or will TLE/fail, do NOT write it. Use the optimal O(n log n) or advanced algorithm instead, and explain the advanced tools clearly in the "explanation" field.
4. **Strict C++ Syntax**: ALWAYS remember semicolons after struct and class definitions (e.g., struct S { ... };). Failure to do so causes compilation errors.
5. **Style**: Use standard global arrays for large datasets (e.g., int a[100005]) to mimic common competitive programming patterns. Use robust 64-bit integers (long long) for large values.
6. **JSON Format**: Return ONLY valid JSON. Return the "solution" key FIRST to ensure it is generated before token limits are hit.

CRITICAL: The "solution" must contain ZERO comments. No // comments, no /* */ comments, no # comments. Not a single comment anywhere. Pure code only.`;

const VERDICT_AR: Record<string, string> = {
    'Accepted': 'اتقبل',
    'Wrong Answer': 'إجابة غلط',
    'Time Limit Exceeded': 'وقت التنفيذ خلص',
    'Compilation Error': 'غلط ترجمة',
    'Runtime Error': 'غلط في التنفيذ',
    'Internal Error': 'غلط من جوا'
};

const SMART_MODE_RULES = `STRICT RULES — Use an EXPERT TEACHING approach:
1. **Optimal Solutions**: Write the most optimal solution with best time/space complexity. Use advanced algorithms, STL containers (vector, map, priority_queue, etc.) freely.
2. **Correctness First**: Passing the judge is the highest priority. Ensure no intermediate overflow or precision issues.
3. **Strict C++ Syntax**: ALWAYS remember semicolons after struct and class definitions (e.g., struct S { ... };). Failure to do so causes compilation errors.
4. **Style**: Use standard competitive programming style. Use 64-bit integers (long long) for safety.
5. **JSON Format**: Return ONLY valid JSON. Return the "solution" key FIRST to avoid token truncation mid-code.

CRITICAL: The "solution" must contain ZERO comments. No // comments, no /* */ comments, no # comments. Not a single comment anywhere. Pure code only.`;

export function useTutor({
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
}: UseTutorProps) {
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState(2);
    const tutorActiveRefs = useRef<Record<string, boolean>>({});
    const abortControllers = useRef<Record<string, AbortController | null>>({});
    const { settings } = useLLM();

    const streamCodeToEditor = useCallback(async (code: string, tabId: string) => {
        if (!onAiCodeUpdate) return;
        const chunkSize = 3;
        for (let i = 0; i <= code.length; i += chunkSize) {
            if (!tutorActiveRefs.current[tabId]) break;
            onAiCodeUpdate(code.substring(0, Math.min(i + chunkSize, code.length)));
            await new Promise(r => setTimeout(r, 12));
        }
        if (tutorActiveRefs.current[tabId]) onAiCodeUpdate(code);
    }, [onAiCodeUpdate]);

    const startTutor = useCallback(async (tabId: string = 'default') => {
        if (tutorActiveRefs.current[tabId]) return;

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

        if (abortControllers.current[tabId]) {
            abortControllers.current[tabId]?.abort();
        }
        abortControllers.current[tabId] = new AbortController();
        const signal = abortControllers.current[tabId]?.signal;

        setConcepts([], tabId);
        setVariants([]);
        setSelectedLevel(2);
        setIsTutorActive(true, tabId);
        tutorActiveRefs.current[tabId] = true;
        setIsLoadingInParent(true, tabId);
        if (onSwitchToAiTab) onSwitchToAiTab();

        const solutionStyle = (typeof window !== 'undefined' ? localStorage.getItem('verdict_solution_style') : 'simple') || 'simple';
        const isSimple = solutionStyle !== 'smart';
        const isArabic = settings.language === 'ar';
        const styleRules = isSimple ? SIMPLE_MODE_RULES : SMART_MODE_RULES;

        const thinkMsgId = `tutor-${Date.now()}`;
        addMessage({
            id: thinkMsgId,
            role: 'assistant',
            content: isArabic ? '<think>\nقراءة المسألة...\n</think>\n\n🍳 *بجهز أطبخ...*' : '<think>\nReading the problem...\n</think>\n\n🍳 *Getting ready to cook...*',
            timestamp: new Date()
        }, tabId);

        if (onAiCodeUpdate) {
            onAiCodeUpdate(`// Analyzing problem...\n// Generating ${isSimple ? 'simple' : 'optimal'} solution...`);
        }

        try {
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
                } catch { }
            }

            const referenceStatusAr = referenceStatus.includes('Verified') ? 'لقيت حل مرجعي. هستخدمه كمرجع.' : 'مفيش حل مرجعي. هحلها من أول وجديد.';
            const languageInstruction = isArabic
                ? '\n\nIMPORTANT LANGUAGE RULE: You MUST write ALL explanations, thinking, approach, and concepts in Egyptian Arabic (عامية مصرية). Use natural Egyptian dialect — not formal Arabic (فصحى). The "solution" code itself stays in the programming language (C++/etc), but the "explanation" and "thinking" fields MUST be in Egyptian colloquial. CRITICAL FORMATTING: Whenever you mix English variables, numbers, formulas, or code (e.g. O(N), vector, 10^5) inside the Arabic text, enclose them in markdown backticks (e.g. `O(N)` or `dp[i]`) so direction renders correctly.'
                : '';

            updateMessage(thinkMsgId, `<think>\n${isArabic ? 'قراءة المسألة...\n' + referenceStatusAr + '\nبحدد القيود والكيسات الصعبة...' : 'Reading the problem...\n' + referenceStatus + '\nIdentifying constraints and edge cases...'}\n</think>\n\n*${isArabic ? 'بقرا المسألة وبجهز المكونات...' : 'Reading the problem and gathering ingredients...'}*`, undefined, tabId);
            await new Promise(r => setTimeout(r, 400));

            const systemPrompt = `You are an elite competitive programming tutor helping a ${isSimple ? 'beginner' : 'skilled programmer'}. You are passionate, slightly quirky, and love 'cooking up' brilliant solutions. You have a lot of 'soul' and personality.

${CODE_TUTOR_PEDAGOGY}

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
In the "explanation" field, use your tutoring style: explain the approach in steps, name key concepts (e.g., "we use a two-pointer technique here"), mention time/space complexity, and point out one or two edge cases so the learner understands why the solution is correct.
CRITICAL: Do NOT use over-engineered intermediate pruning logic (e.g., stopping if current_product > 1000) unless absolutely necessary for performance, as it often leads to wrong answers for negative numbers or large results. Use robust 64-bit integers (long long in C++) and check for exact equality at the end.

REFERENCE SOLUTION GUIDANCE: If a verified reference solution is provided, you MUST maintain its algorithmic complexity. If the reference is O(n log n), do NOT downgrade to O(n²) even in "simple" mode, as it will likely fail for large inputs. Adapt the reference solution's core logic into your style while ensuring it remains highly efficient.

SPECIAL INSTRUCTION FOR MULTIPLE SOLUTIONS: If the problem allows multiple valid answers (e.g., "output any solution"), you MUST still prioritize matching the exact values provided in the example cases. This ensures you pass the strict judge checker. ${referenceBlock}${languageInstruction}`;

            const userPrompt = `Problem:\n${problemDescription}\n\nWrite a ${isSimple ? 'simple, beginner-friendly' : 'optimal'} solution in ${language}.${referenceBlock ? ' You have a verified reference solution — use it to ensure your logic is correct.' : ''} Return ONLY valid JSON. Remember: ZERO comments in the solution code.`;

            const initialMessages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];
            const currentMessages: { role: string; content: string }[] = [...initialMessages];

            let attempt = 0;
            let scratchpadCount = 0;
            const maxAttempts = isSimple ? 3 : 5;
            let finalSolution = "";
            let finalThinkingText = "";
            let finalApproachText = "";
            let finalExplanation = "";
            let judgePassed = false;
            let judgeResultLine = "";
            let lastPassCount: number | undefined; // preserve across retries (data is overwritten each attempt)
            let data: TutorResponseData = {};

            updateMessage(thinkMsgId, `<think>\n${isArabic ? 'قراءة المسألة...\n' + referenceStatusAr + '\nبحدد القيود والكيسات الصعبة...\nبالفسر الطريقة...' : 'Reading the problem...\n' + referenceStatus + '\nIdentifying constraints and edge cases...\nThinking about the approach...'}\n</think>\n\n🍳 *${isArabic ? 'بجهز أطبخ...' : 'Getting ready to cook...'}*`, undefined, tabId);

            while (attempt < maxAttempts) {
                attempt++;

                if (attempt > 1) {
                    const passCount = lastPassCount ?? 0;
                    const totalCount = testCases.length;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**' + (isArabic ? 'الطريقة:** ' : 'Approach:** ') + finalApproachText : ''}\n\n${isArabic ? `جربت الحل... فشل (اتقبل ${passCount}/${totalCount} من اللي فاتوا).\n\nبعيد أحاول تاني (محاولة ${attempt}/${maxAttempts})...` : `Testing attempted solution... Failed (${passCount}/${totalCount} tests passed).\n\nRetrying approach (Attempt ${attempt}/${maxAttempts})...`}\n</think>\n\n*${isArabic ? `بصلح الغلط (اتقبل ${passCount}/${totalCount}). بشتغل على حل...` : `Debugging failing tests (Passed ${passCount}/${totalCount}). Working on a fix...`}*`, undefined, tabId);
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
                                    }
                                    if (parsedChunk.choices?.[0]?.finish_reason) {
                                        finishReason = parsedChunk.choices[0].finish_reason;
                                    }
                                } catch (_e) { }
                            }
                        }

                        // Parse out partial 'content' and 'thinking' using pure linear string matching (avoiding regex catastrophic backtracking)
                        let partialContent = '';
                        if (buffer.trim()) {
                            const cKey = '"content":';
                            const cIdx = buffer.indexOf(cKey);
                            if (cIdx !== -1) {
                                let cStart = buffer.indexOf('"', cIdx + cKey.length);
                                if (cStart !== -1) {
                                    cStart += 1;
                                    let cEnd = cStart;
                                    while (cEnd < buffer.length && !(buffer[cEnd] === '"' && buffer[cEnd - 1] !== '\\')) cEnd++;
                                    partialContent = buffer.substring(cStart, cEnd).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                }
                            }
                        }

                        const streamedSoFar = rawContent + partialContent;
                        const tKey = '"thinking":';
                        const tIdx = streamedSoFar.indexOf(tKey);
                        if (tIdx !== -1) {
                            let tStart = streamedSoFar.indexOf('"', tIdx + tKey.length);
                            if (tStart !== -1) {
                                tStart += 1;
                                let tEnd = tStart;
                                while (tEnd < streamedSoFar.length && !(streamedSoFar[tEnd] === '"' && streamedSoFar[tEnd - 1] !== '\\')) tEnd++;
                                const partialThink = streamedSoFar.substring(tStart, tEnd).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                                updateMessage(thinkMsgId, `<think>\n${partialThink}\n</think>\n\n*${isArabic ? 'بجهز أطبخ...' : 'Getting ready to cook...'}*`, undefined, tabId);
                            }
                        }
                    }
                    if (!rawContent && buffer.trim().startsWith('{')) {
                        try {
                            const fullObj = JSON.parse(buffer.trim());
                            const messageContent = fullObj.choices?.[0]?.message?.content || fullObj.choices?.[0]?.delta?.content || fullObj.message?.content || fullObj.content || '';
                            if (messageContent) {
                                rawContent = messageContent;
                                if (fullObj.choices?.[0]?.finish_reason) {
                                    finishReason = fullObj.choices[0].finish_reason;
                                }
                            }
                        } catch (_e) { }
                    }
                }

                if (finishReason === 'length' || finishReason === 'max_tokens') {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response was cut off because you hit the maximum token limit. Your "thinking" section was too long, preventing you from finishing the solution. Please try again. Keep your "thinking" strictly under 250 words so you have space to write the full C++ solution.`
                    });
                    const latestThink = isArabic
                        ? "خطأ: تم الوصول للحد الأقصى للكلمات المسموحة. الإجابة اتقطعت. هحاول تاني بتفكير أوجز..."
                        : "Error: Hit maximum token limit. The output was cut off mid-sentence. Retrying with a more concise thought process...";
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- ${isArabic ? 'محاولة تصليح' : 'Fixing Attempt'} ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *${isArabic ? 'خلصت الكلمات المسموحة. بحاول تاني باختصار' : 'Ran out of tokens. Retrying more concisely'}...*`, undefined, tabId);
                    continue;
                }

                if (!rawContent) {
                    throw new Error('The AI provided an empty response.');
                }

                try {
                    data = extractAndParseJson<TutorResponseData>(rawContent);
                } catch (parseErr: unknown) {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response was invalid JSON or truncated: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}. Please try again and ensure you close all JSON brackets and provide the full solution.`
                    });
                    const latestThink = isArabic ? "غلط في قراءة رد البوت. تفاصيل تقنية: " + (parseErr instanceof Error ? parseErr.message : String(parseErr)) : "Error parsing response: " + (parseErr instanceof Error ? parseErr.message : String(parseErr));
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- ${isArabic ? 'محاولة تصليح' : 'Fixing Attempt'} ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *${isArabic ? 'النص اتقطع. بحاول تاني' : 'JSON Truncated. Retrying'}...*`, undefined, tabId);
                    continue;
                }

                if (data.python_scratchpad && !data.solution) {
                    scratchpadCount++;
                    if (scratchpadCount > 3) {
                        currentMessages.push({ role: 'assistant', content: rawContent });
                        currentMessages.push({
                            role: 'user',
                            content: `You have reached the maximum number of Python Scratchpad executions (3) for this problem. You MUST now proceed with the final Option 1 JSON schema and provide your C++ solution.`
                        });
                        const latestThink = isArabic ? "غلط: وصلت لآخر عدد تجارب. بكتب الحل النهائي..." : "Error: Maximum scratchpad limit reached. Retrying with final C++ solution...";
                        finalThinkingText += `\n\n**-- ${isArabic ? 'وصلت لآخر عدد تجارب' : 'Max Scratchpads Reached'} --**\n` + latestThink;
                        updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *${isArabic ? 'خلصت محاولات التجربة. هكتب الحل النهائي' : 'Scratchpad limit reached. Proceeding with solution'}...*`, undefined, tabId);
                        attempt--;
                        continue;
                    }

                    const scratchpadThink = data.thinking || (isArabic ? 'بستخدم بايثون عشان أجرب وألاقي نمط للحل...' : 'Using Python scratchpad to find a pattern...');
                    finalThinkingText += (attempt === 1 && scratchpadCount === 1 ? '' : '\n\n') + scratchpadThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n🐍 *${isArabic ? 'بجرب الكود على بايثون عشان أكتشف الحل...' : 'Running Python scratchpad on local Judge0 to find a pattern...'}*`, undefined, tabId);

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
                            content: `Your Python scratchpad executed successfully. Output:\n\n${scratchOutput}\n\nPlease use this insight to write the final optimal C++ solution.`
                        });
                    } catch (_e: unknown) {
                        currentMessages.push({ role: 'assistant', content: rawContent });
                        currentMessages.push({
                            role: 'user',
                            content: `Your Python scratchpad encountered an error. Please proceed with Option 1.`
                        });
                    }
                    attempt--;
                    continue;
                }

                if (!data.solution || typeof data.solution !== 'string') {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your response did not include a valid "solution" string field.`
                    });
                    const latestThink = isArabic ? "غلط: مفيش حل أو الحل مش مكتوب صح. بحاول تاني..." : "Error: Invalid or missing solution field. Retrying...";
                    finalThinkingText += (attempt === 1 ? '' : `\n\n**-- ${isArabic ? 'محاولة تصليح' : 'Fixing Attempt'} ${attempt} --**\n`) + latestThink;
                    updateMessage(thinkMsgId, `<think>\n${finalThinkingText}\n</think>\n\n⚠️ *${isArabic ? 'الحل مش مكتوب صح. بحاول تاني' : 'Invalid solution format. Retrying'}...*`, undefined, tabId);
                    continue;
                }

                const cleanSolution = data.solution
                    .replace(/\/\/.*$/gm, '')
                    .replace(/\/\*[\s\S]*?\*\//g, '')
                    .replace(/^\s*\n/gm, '');

                const latestThink = data.thinking || (isArabic ? 'بحلل المسألة وبكتب الحل.' : 'Analyzing the problem and formulating a solution.');
                if (attempt === 1) {
                    finalThinkingText = latestThink;
                } else {
                    finalThinkingText += `\n\n**-- ${isArabic ? 'محاولة تصليح' : 'Fixing Attempt'} ${attempt} --**\n` + latestThink;
                }

                finalApproachText = data.approach || '';
                finalExplanation = data.explanation || '';
                finalSolution = cleanSolution;

                const thinkBase = `${finalThinkingText}${finalApproachText ? '\n\n**' + (isArabic ? 'الطريقة:** ' : 'Approach:** ') + finalApproachText : ''}`;
                const testMsgInternal = isArabic ? `بجرب الحل على منصة التحكيم (محاولة ${attempt}/${maxAttempts})...` : `Testing attempted solution against Judge0 (Attempt ${attempt}/${maxAttempts})...`;
                updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\n${testMsgInternal}\n</think>\n\n⚙️ *${testMsgInternal}*`, undefined, tabId);

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
                            const verdictLabel = isArabic ? (VERDICT_AR[judgeVerdict] || judgeVerdict) : judgeVerdict;
                            judgeResultLine = isArabic ? `**${verdictLabel}** — كل الاختبارات (${testCases.length}) اتقبلت` : `**${judgeVerdict}** — All ${testCases.length} test${testCases.length > 1 ? 's' : ''} passed`;
                        } else {
                            const failedCase = judgeData.results?.find((r: { passed?: boolean }) => !r.passed);
                            let judgeDetails = failedCase ? (isArabic ? ` (اختبار ${failedCase.testCase}: ${VERDICT_AR[failedCase.verdict] || failedCase.verdict})` : ` (Test ${failedCase.testCase}: ${failedCase.verdict})`) : '';
                            if (failedCase?.compileError) {
                                judgeDetails += isArabic ? `\n\nمخرجات الترجمة:\n` : `\n\nCompiler Output:\n`;
                                judgeDetails += failedCase.compileError.substring(0, 1000);
                            } else if (failedCase?.runtimeError) {
                                judgeDetails += isArabic ? `\n\nمخرجات غلط التنفيذ:\n` : `\n\nRuntime Error Output:\n`;
                                judgeDetails += failedCase.runtimeError.substring(0, 1000);
                            }
                            judgeResultLine = `**${isArabic ? (VERDICT_AR[judgeData.verdict] || judgeData.verdict) : judgeData.verdict}**${judgeDetails}`;
                            lastPassCount = judgeData.testsPassed;
                            data.passCount = judgeData.testsPassed;
                        }
                    } else {
                        judgePassed = false;
                        judgeResultLine = isArabic ? `**غلط في منصة التحكيم**` : `**Judge Error**`;
                    }
                } catch (_err) {
                    judgePassed = false;
                    judgeResultLine = isArabic ? `**منصة التحكيم مش شغالة**` : `**Judge unavailable**`;
                }

                if (judgePassed && referenceCode && finalSolution && attempt < maxAttempts) {
                    // Only run fuzzer in smart mode. In simple mode the problem is "not that deep" — Judge0 pass is enough.
                    const shouldFuzz = !isSimple;
                    if (!shouldFuzz) {
                        break;
                    }

                    const edgeCaseCount = 2;
                    const passWaitInternal = isArabic ? `${testMsgInternal} اتقبل في الاختبارات العادية!\n\nبنشئ ${edgeCaseCount} كيسات صعبة عشان أختبر الحل...` : `${testMsgInternal} Passed sample tests!\n\nGenerating ${edgeCaseCount} tricky edge cases for stress-testing...`;
                    updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\n${passWaitInternal}\n</think>\n\n🕵️ *${isArabic ? "استنى، مخلصتش التقييم!" : "Wait, I'm not done!"}*`, undefined, tabId);

                    try {
                        const edgeCasePrompt = `Generate exactly ${edgeCaseCount} tricky edge-case inputs for this problem. Return ONLY a JSON object containing an "inputs" array of ${edgeCaseCount} strings.`;
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
                                    { role: 'system', content: `You are a strict test case generator. Return ONLY {"inputs": ["input1", "input2"]} with exactly ${edgeCaseCount} inputs.` },
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
                                const edgeInputs = edgeObj.inputs.slice(0, edgeCaseCount);
                                const passFuzzInternal = isArabic ? `${testMsgInternal} اتقبل!\n\nاستخرجت ${edgeInputs.length} كيسات صعبة.` : `${testMsgInternal} Passed sample tests!\n\nGenerated ${edgeInputs.length} edge cases.`;
                                updateMessage(thinkMsgId, `<think>\n${thinkBase}\n\n${passFuzzInternal}\n</think>\n\n🏎️ *${isArabic ? "بقارن نواتج الكود بتاعي مع الحل المرجعي..." : "Fuzzing my code against the verified solution..."}*`, undefined, tabId);

                                const fuzzRes = await fetch('/api/judge/fuzz', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        aiSolution: finalSolution,
                                        referenceSolution: referenceCode,
                                        language: language,
                                        edgeCases: edgeInputs
                                    }),
                                    signal
                                });

                                if (fuzzRes.ok) {
                                    const fuzzData = await fuzzRes.json();
                                    if (!fuzzData.passed && fuzzData.failingCase) {
                                        judgePassed = false;
                                        judgeResultLine = isArabic ? `**إجابة غلط في كيس صعب**` : `**Wrong Answer on hidden edge case**`;
                                        lastPassCount = testCases.length;
                                        data.passCount = testCases.length;
                                        currentMessages.push({ role: 'assistant', content: rawContent });
                                        currentMessages.push({
                                            role: 'user',
                                            content: `Your solution failed on a generated edge case during stress-testing.\n\n**Input:**\n${fuzzData.failingCase.input}\n\n**Expected:**\n${fuzzData.failingCase.expected}\n\n**Result:**\n${fuzzData.failingCase.actual}`
                                        });
                                        continue;
                                    }
                                }
                            }
                        }
                    } catch (_e) { }
                }

                if (judgePassed || attempt === maxAttempts) {
                    break;
                } else {
                    currentMessages.push({ role: 'assistant', content: rawContent });
                    currentMessages.push({
                        role: 'user',
                        content: `Your solution failed the tests. Judge verdict: ${judgeResultLine}. Please fix the errors and try again.`
                    });
                }
            }

            const hasValidSolution = finalSolution.trim().length > 0;

            if (hasValidSolution) {
                updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**' + (isArabic ? 'الطريقة:** ' : 'Approach:** ') + finalApproachText : ''}\n</think>\n\n*${isArabic ? 'بكتب الحل...' : 'Writing solution...'}*`, undefined, tabId);

                await new Promise(r => setTimeout(r, 300));
                updateMessage(thinkMsgId, `<think>\n${finalThinkingText}${finalApproachText ? '\n\n**' + (isArabic ? 'الطريقة:** ' : 'Approach:** ') + finalApproachText : ''}\n\n${isArabic ? 'كتابة الكود...' : 'Writing code...'}\n</think>\n\n*${isArabic ? 'بكتب الكود في المحرر...' : 'Writing solution code to editor...'}*`, undefined, tabId);

                await streamCodeToEditor(finalSolution, tabId);
            }

            const thinkBaseFinal = `${finalThinkingText}${finalApproachText ? '\n\n**' + (isArabic ? 'الطريقة:** ' : 'Approach:** ') + finalApproachText : ''}`;
            const finalThinkBlock = `<think>\n${thinkBaseFinal}\n\n${isArabic ? 'الكود اتكتب بنجاح' : 'Code written successfully'}\n\n${judgeResultLine}\n</think>`;

            let combinedMessage = '';
            if (!hasValidSolution) {
                combinedMessage = finalThinkBlock + `\n\n${isArabic ? 'ماقدرتش أطلع حل يعدي. جرب تاني أو اطلب تلميح في الشات.' : `I couldn't produce a valid solution after ${maxAttempts} attempts. Please try again or ask for a hint in the chat.`}`;
                updateMessage(thinkMsgId, combinedMessage, undefined, tabId);
            } else if (judgePassed) {
                combinedMessage = finalThinkBlock + `\n\n${finalExplanation}\n\n${isArabic ? 'الحل اتكتب في المحرر وكل الاختبارات اتقبلت.' : 'The solution has been written to the editor and passes all test cases.'}`;
                updateMessage(thinkMsgId, combinedMessage, undefined, tabId);
            } else {
                combinedMessage = finalThinkBlock + `\n\n${finalExplanation}\n\n${isArabic ? 'الحل ممكن محتاج شوية تعديلات. قول لي أصلحه في الشات لو حابب.' : 'The solution might need adjustments. Try asking me to fix it in the chat.'}`;
                updateMessage(thinkMsgId, combinedMessage, undefined, tabId);
            }

            // Explicitly log this robust Teach Me AI payload
            try {
                fetch('/api/ai/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: problemId || 'unknown',
                        role: 'assistant',
                        content: combinedMessage,
                        contextType: 'teach_me'
                    })
                }).catch(() => { });
            } catch (_e) { }

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
                    const ytVideo = ytData.results?.find((r: { type?: string }) => r.type === 'youtube');
                    if (ytVideo) {
                        const v = ytVideo as { title?: string; url?: string };
                        finalConcepts = [
                            {
                                title: v.title ?? 'Video',
                                type: 'video' as const,
                                url: v.url ?? ''
                            },
                            ...finalConcepts
                        ];
                    }
                }
            } catch (_e) { }

            if (finalConcepts.length > 0) {
                setConcepts(finalConcepts, tabId);
            }

        } catch (_err: unknown) {
            if (_err instanceof Error && (_err.name === 'AbortError' || _err.message === 'signal is aborted without reason')) {
                updateMessage(thinkMsgId, settings.language === 'ar' ? 'جلسة التعليم اتوقفت.' : `Tutor session was stopped.`, undefined, tabId);
            } else {
                setIsLoadingInParent(false, tabId);
                setIsTutorActive(false, tabId);
                addMessage({
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: `${settings.language === 'ar' ? 'حصل غلط' : 'Error'}: ${_err instanceof Error ? _err.message : String(_err)}.`,
                    timestamp: new Date()
                }, tabId);
            }
        } finally {
            setIsLoadingInParent(false, tabId);
            setIsTutorActive(false, tabId);
            tutorActiveRefs.current[tabId] = false;
        }
    }, [problemId, language, problemDescription, testCases, settings, getHeaders, onAiCodeUpdate, onSwitchToAiTab, addMessage, updateMessage, setConcepts, setIsTutorActive, streamCodeToEditor, setIsLoadingInParent]);

    const changeLevel = useCallback(async (level: number) => {
        setSelectedLevel(level);
    }, []);

    const stopTutor = useCallback((tabId?: string) => {
        if (tabId) {
            tutorActiveRefs.current[tabId] = false;
            setIsTutorActive(false, tabId);
            setIsLoadingInParent(false, tabId);
            if (abortControllers.current[tabId]) {
                try {
                    abortControllers.current[tabId]?.abort();
                } catch (_e) {
                    // Ignore already aborted or restricted signals
                }
                abortControllers.current[tabId] = null;
            }
        } else {
            Object.keys(tutorActiveRefs.current).forEach(id => {
                tutorActiveRefs.current[id] = false;
                setIsTutorActive(false, id);
                setIsLoadingInParent(false, id);
                if (abortControllers.current[id]) {
                    try {
                        abortControllers.current[id]?.abort();
                    } catch (_e) { }
                    abortControllers.current[id] = null;
                }
            });
        }
    }, [setIsTutorActive, setIsLoadingInParent]);

    return {
        variants,
        selectedLevel,
        changeLevel,
        startTutor,
        stopTutor
    };
}
