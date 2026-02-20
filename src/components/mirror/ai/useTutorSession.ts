'use client';

import { useState, useRef, useCallback } from 'react';
import { useLLM } from '@/lib/useLLM';

interface Concept {
    title: string;
    url: string;
    type: 'video' | 'article';
}

interface TutorStep {
    type: 'explain' | 'type';
    text?: string;
    code?: string;
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
    const [mainSteps, setMainSteps] = useState<TutorStep[]>([]);
    const [selectedLevel, setSelectedLevel] = useState(2);
    const tutorActiveRef = useRef(false);
    const { settings } = useLLM();

    const playSequence = useCallback(async (steps: TutorStep[], fullSolution: string) => {
        let currentRevealedLength = 0;
        let accumulatedExplain = '';
        const msgId = `${Date.now()}-${Math.random()}`;

        // Initialize code
        if (onAiCodeUpdate) onAiCodeUpdate(`// Switching to Level...`);
        await new Promise(r => setTimeout(r, 500));
        if (onAiCodeUpdate) onAiCodeUpdate('');

        // Pre-create the single message if there are explain steps
        const hasExplains = steps.some(s => s.type === 'explain');
        if (hasExplains) {
            addMessage({
                id: msgId,
                role: 'assistant',
                content: '<think>\nInitializing step-by-step playback...\n</think>',
                timestamp: new Date()
            });
        }

        // Execute steps sequentially
        for (const step of steps) {
            if (!tutorActiveRef.current) break;

            if (step.type === 'explain' && step.text) {
                accumulatedExplain += (accumulatedExplain ? '\n\n' : '') + step.text;
                // Update the single message with the accumulated thought process
                updateMessage(msgId, `<think>\n${accumulatedExplain}\n</think>\n\nTyping code...`);
                // Wait briefly for reading
                await new Promise(r => setTimeout(r, 800));
            } else if (step.type === 'type' && step.code) {
                if (onAiCodeUpdate) {
                    // Reveal strategy: animate from current length to target length
                    const segmentLength = step.code.length;
                    const targetLength = Math.min(currentRevealedLength + segmentLength, fullSolution.length);
                    const chunkSize = 5;

                    while (currentRevealedLength < targetLength) {
                        if (!tutorActiveRef.current) break;

                        currentRevealedLength = Math.min(currentRevealedLength + chunkSize, targetLength);
                        onAiCodeUpdate(fullSolution.substring(0, currentRevealedLength));

                        await new Promise(r => setTimeout(r, 20)); // Faster 20ms
                    }
                }
            }
        }

        // Finalize
        if (onAiCodeUpdate && fullSolution && tutorActiveRef.current) {
            onAiCodeUpdate(fullSolution);
        }

        // Finalize the message text
        if (hasExplains && tutorActiveRef.current) {
            updateMessage(msgId, `<think>\n${accumulatedExplain}\n</think>\n\nFinished typing solution.`);
        }
    }, [onAiCodeUpdate, addMessage, updateMessage]);

    const startTutor = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (tutorActiveRef.current) {
            console.log('[Tutor] Already active, ignoring call');
            return;
        }

        if (isLoading) {
            console.log('[Tutor] Already loading, ignoring call');
            return;
        }

        // Validate test cases
        if (!testCases || testCases.length === 0) {
            console.error('[Tutor] No test cases available');
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Unable to start tutor: No test cases available for this problem. Test cases are required to verify solutions.',
                timestamp: new Date()
            });
            return;
        }

        if (!settings.enabled || !settings.apiKey) {
            addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Please configure Bring Your Own LLM settings first by clicking the configuration button.',
                timestamp: new Date()
            });
            return;
        }

        // Parse IDs
        let cId = 'TUTOR';
        let pId = 'TUTOR';
        if (problemId) {
            const parts = problemId.split('-');
            if (parts.length >= 2) {
                cId = parts[0];
                pId = parts.slice(1).join('-');
            }
        }

        // Reset state
        setConcepts([]);
        setVariants([]);
        setSelectedLevel(2);
        setMainSteps([]);
        setIsTutorActive(true);
        tutorActiveRef.current = true;
        setIsLoading(true);
        if (onSwitchToAiTab) onSwitchToAiTab();

        // 1. Add "Thinking" message
        const thinkingMsgId = Date.now().toString();
        addMessage({
            id: thinkingMsgId,
            role: 'assistant',
            content: 'Verdict Verification Protocol Initiated... prioritizing O(N) solution.',
            timestamp: new Date()
        });

        // Set initial ghost typing placeholder
        if (onAiCodeUpdate) {
            onAiCodeUpdate(`// Verdict is analyzing problem constraints...\n// Generating optimal solution...`);
        }

        try {
            // 2. Call API directly to BYOK LLM
            const systemTutorPrompt = `You are an expert competitive programming tutor.
You MUST respond with ONLY valid JSON and no markdown wrapping.
The JSON must have the following structure:
{
  "success": true,
  "verdict": "ACCEPTED",
  "concepts": [ { "title": "Example Concept", "url": "#", "type": "article" } ],
  "variants": [
      {
          "level": 2,
          "title": "Optimal",
          "timeComplexity": "O(N)",
          "comment": "Optimal approach",
          "code": "full code string"
      }
  ],
  "steps": [
      { "type": "explain", "text": "let's start..." },
      { "type": "type", "code": "full code string" }
  ],
  "solution": "full code string"
}`;

            const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:]\/)\/+/g, "$1"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    response_format: { type: "json_object" },
                    messages: [
                        { role: 'system', content: systemTutorPrompt },
                        { role: 'user', content: `Problem Description:\n${problemDescription}\n\nLanguage: ${language}\n\nProvide the solution as JSON. The full code string must be syntactically correct and run successfully. Write it natively in ${language}. Use the exact response format JSON requested.` }
                    ]
                })
            });

            if (!response.ok) {
                let errorDetails = 'Unknown error';
                try {
                    const errorJson = await response.json();
                    errorDetails = JSON.stringify(errorJson);
                } catch (e) {
                    errorDetails = await response.text();
                }
                console.error('[Tutor Error] Status:', response.status, 'Details:', errorDetails);
                throw new Error(`Failed to start tutor session (${response.status}): ${errorDetails}`);
            }

            const chatObj = await response.json();
            const contentText = chatObj.choices?.[0]?.message?.content || "{}";
            const data = JSON.parse(contentText) as { success?: boolean; error?: string; verdict?: string; concepts?: unknown[]; variants?: unknown[]; steps?: unknown[]; solution?: string };
            data.success = true;

            if (!data.success) {
                updateMessage(thinkingMsgId, `I encountered an error: ${data.error || 'Unknown error'}`);
                setIsTutorActive(false);
                tutorActiveRef.current = false;
                setIsLoading(false);
                return;
            }

            // 3. Test the generated solution with internal Judge0 endpoint
            let judgePassed = true;
            let judgeVerdict = data.verdict || 'ACCEPTED';
            let judgeErrorDetails = '';

            if (data.solution) {
                try {
                    updateMessage(thinkingMsgId, `Testing generated solution against ${testCases.length} constraints using Judge0...`);

                    const judgeResponse = await fetch('/api/judge/test', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sourceCode: data.solution,
                            language: language,
                            testCases: testCases.map((tc: any) => ({
                                input: tc.input,
                                output: tc.output || tc.expectedOutput || ''
                            })),
                            timeLimit: 2000,
                            memoryLimit: 256
                        })
                    });

                    if (judgeResponse.ok) {
                        const judgeData = await judgeResponse.json();
                        judgePassed = judgeData.passed;
                        judgeVerdict = judgeData.verdict;
                        if (!judgePassed) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const failedCases = judgeData.results?.filter((r: any) => !r.passed) || [];
                            if (failedCases.length > 0) {
                                judgeErrorDetails = `\nFailed Case ${failedCases[0].testCase}: ${failedCases[0].verdict}`;
                            } else {
                                judgeErrorDetails = '\nFailed on provided test cases.';
                            }
                        }
                    } else {
                        judgePassed = false;
                        judgeVerdict = 'JUDGE_ERROR';
                        judgeErrorDetails = '\nUnable to execute against Judge0 api.';
                    }
                } catch (err) {
                    console.error('[Tutor Judge Error]', err);
                    judgePassed = false;
                    judgeVerdict = 'JUDGE_CRASH';
                }
            }

            // Save state
            if (data.concepts) setConcepts(data.concepts as any);
            if (data.variants) setVariants(data.variants as any);
            if (data.steps) setMainSteps(data.steps as any);

            // 4. Success or Failure Display
            if (judgePassed) {
                updateMessage(thinkingMsgId, `Solution Verified by Judge0 (Verdict: **${judgeVerdict}**). Starting playback...`);
            } else {
                updateMessage(thinkingMsgId, `Warning: AI Solution Verification Failed by Judge0 (Verdict: **${judgeVerdict}**).${judgeErrorDetails}\nI'll show you the code anyway so we can fix it together.`);
            }

            // Play the solution with steps
            if (data.steps && data.solution) {
                await playSequence(data.steps as any, data.solution);
            } else {
                console.error('[Tutor] Missing steps or solution in response');
                addMessage({
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: 'Solution generated but missing details.',
                    timestamp: new Date()
                });
            }

        } catch (error) {
            console.error('[Tutor] Error:', error);
            updateMessage(thinkingMsgId, 'Something went wrong starting the tutor session.');
            setIsTutorActive(false);
            tutorActiveRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [problemId, language, problemDescription, testCases, getHeaders, onAiCodeUpdate, onSwitchToAiTab, addMessage, updateMessage, playSequence]);

    const changeLevel = useCallback(async (level: number) => {
        if (!variants || variants.length === 0) return;

        // Stop any current playback
        tutorActiveRef.current = false;
        await new Promise(r => setTimeout(r, 100)); // Wait for loop to break
        tutorActiveRef.current = true; // Re-enable

        setSelectedLevel(level);
        const variant = variants.find(v => v.level === level);

        if (!variant) return;

        let steps: TutorStep[] = [];
        if (level === 2 && mainSteps.length > 0) {
            steps = mainSteps;
        } else if (level === 2 && variant.steps) {
            steps = [
                { type: 'explain', text: `Here is the ${variant.title} approach.` },
                { type: 'type', code: variant.code }
            ];
        } else {
            const complexityInfo = variant.timeComplexity ? `Time: ${variant.timeComplexity}` : '';
            steps = [
                { type: 'explain', text: `**${variant.title} Solution**\n${variant.comment}\n${complexityInfo}` },
                { type: 'type', code: variant.code }
            ];
        }

        await playSequence(steps as TutorStep[], variant.code);

    }, [variants, playSequence, mainSteps]);

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
