'use client';

import { useState, useRef, useCallback } from 'react';

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

    // Reusable playback function
    const playSequence = useCallback(async (steps: TutorStep[], fullSolution: string) => {
        let currentRevealedLength = 0;

        // Initialize code
        if (onAiCodeUpdate) onAiCodeUpdate(`// Switching to Level...`);
        await new Promise(r => setTimeout(r, 500));
        if (onAiCodeUpdate) onAiCodeUpdate('');

        // Execute steps sequentially
        for (const step of steps) {
            if (!tutorActiveRef.current) break;

            if (step.type === 'explain' && step.text) {
                addMessage({
                    id: `${Date.now()}-${Math.random()}`,
                    role: 'assistant',
                    content: step.text,
                    timestamp: new Date()
                });
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
    }, [onAiCodeUpdate, addMessage]);

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
            // 2. Call API
            const response = await fetch('/api/ai/tutor/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getHeaders()
                },
                body: JSON.stringify({
                    contestId: cId,
                    problemId: pId,
                    prompt: "Solve this problem",
                    problemDescription: problemDescription || '',
                    testCases: testCases,
                    language: language
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

            const data = await response.json() as { success?: boolean; error?: string; verdict?: string; concepts?: unknown[]; variants?: unknown[]; steps?: unknown[]; solution?: string };

            if (!data.success) {
                updateMessage(thinkingMsgId, `I encountered an error: ${data.error || 'Unknown error'}`);
                setIsTutorActive(false);
                tutorActiveRef.current = false;
                setIsLoading(false);
                return;
            }

            // Save state
            if (data.concepts) setConcepts(data.concepts as any);
            if (data.variants) setVariants(data.variants as any);
            if (data.steps) setMainSteps(data.steps as any);

            // 3. Success! Start Ghost Typing Playback (Default Level 2)
            updateMessage(thinkingMsgId, `Solution Verified (Verdict: **${data.verdict || 'ACCEPTED'}**).`);

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
