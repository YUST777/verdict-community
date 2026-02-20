
import { executeBatchOnJudge0, TestCase } from './judge';
import { callGeminiAPI } from './ai-api-client';
import { VERIFIED_TOPICS, normalizeTopic } from './resources/verified-content';
import { validateLink } from './link-validator';
import { getVerifiedVideo } from './youtube-verification';

/**
 * Interface for the AI Solution response
 */
export interface AISolutionResponse {
    success: boolean;
    solution?: string;
    explanation?: string;
    attempts: number;
    verdict?: string;
    error?: string;
    steps?: Array<{
        time: number;
        type: 'explain' | 'type';
        text?: string;
        code?: string;
        position?: string;
    }>;
    concepts?: Array<{
        title: string;
        url: string;
        type: 'video' | 'article' | 'youtube';
    }>;
}

/**
 * Generate a solution, verify it against Judge0, and explain it.
 */
export async function generateAndVerifySolution(
    prompt: string,
    problemDescription: string,
    testCases: TestCase[],
    language: string = 'cpp',
    maxRetries: number = 3
): Promise<AISolutionResponse> {

    let attempts = 0;
    let currentSolution = '';
    let lastError = '';

    if (!testCases || testCases.length === 0) {
        return {
            success: false,
            error: "No test cases provided for verification. Cannot solve.",
            attempts: 0
        };
    }

    // 1. Generate & Verify Loop
    while (attempts < maxRetries) {
        attempts++;

        // Construct Prompt
        const systemPrompt = `
        You are an expert competitive programmer. 
        Task: Write a correct ${language} solution for the following problem. 
        Rules:
        1. Output ONLY the raw code within \`\`\`${language} \`\`\` blocks.
        2. CLEAN CODE ONLY: Do NOT include comments in the code. The explanation will be separate.
        3. Optimize for time and memory.
        4. IF LANGUAGE IS JAVA, THE CLASS MUST BE NAMED 'Main' (public class Main).
        5. IF LANGUAGE IS PYTHON, DO NOT WRAP IN 'if __name__ == "__main__":' unless necessary.
        6. IF LANGUAGE IS C#, THE CLASS MUST BE NAMED 'Program' AND INCLUDE 'using System;'.
        7. IF LANGUAGE IS GO, THE PACKAGE MUST BE 'main' (package main).
        8. IF LANGUAGE IS NODE.JS/JAVASCRIPT, USE 'fs' OR 'readline' FOR INPUT.
        9. IF LANGUAGE IS KOTLIN, DO NOT USE PACKAGE DECLARATION.
        10. IF LANGUAGE IS RUST, USE 'fn main()'.
        11. DO NOT INCLUDE ANY COMMENTS IN THE CODE. THE CODE MUST BE CLEAN AND COMMENT-FREE.
        ${lastError ? `\nPrevious attempt failed with error: ${lastError}\nFix this specific error.` : ''}
        `;

        const fullPrompt = `${systemPrompt}\n\nProblem:\n${problemDescription}\n\nUser Request: ${prompt}`;

        try {
            // Call AI to generate code
            const { text } = await callGeminiAPI({
                contents: [{ parts: [{ text: fullPrompt }] }]
            });

            // Extract code block
            // Updated regex to support all languages (csharp, go, rust, etc.)
            const codeMatch = text.match(/```(?:[\w\-\+\.]+)?\s*([\s\S]*?)```/i);
            if (!codeMatch) {
                lastError = "Failed to parse code block from response.";
                continue;
            }

            currentSolution = codeMatch[1].trim();

            // Verify with Judge0
            const judgeResult = await executeBatchOnJudge0(
                currentSolution,
                language,
                testCases
            );

            if (judgeResult.passed) {
                // Success! Generate Explanation
                return await generateExplanationStep(currentSolution, language, problemDescription);
            } else {
                // Failed - Feedback loop
                if (judgeResult.error) {
                    lastError = `Execution Error: ${judgeResult.error} ${judgeResult.details ? `\nDetails: ${judgeResult.details}` : ''}`;
                } else {
                    const failedTest = judgeResult.results.find(r => !r.passed);
                    // Safe array access with bounds checking
                    const testIndex = Math.max(0, Math.min((failedTest?.testCase || 1) - 1, testCases.length - 1));
                    const failedTestCase = testCases[testIndex];

                    lastError = `Verdict: ${judgeResult.verdict}. Failed on test case ${failedTest?.testCase}. 
                    Input: ${failedTestCase?.input?.substring(0, 100) || 'N/A'}...
                    Expected: ${failedTestCase?.output?.substring(0, 100) || 'N/A'}...
                    Actual: ${failedTest?.output?.substring(0, 100) || 'N/A'}...
                    Compiler/Runtime Error: ${failedTest?.compileError || failedTest?.runtimeError || 'None'}`;
                }
            }

        } catch (error: any) {
            console.error(`Attempt ${attempts} failed:`, error);
            lastError = `Internal Error: ${error.message}`;
        }
    }

    return {
        success: false,
        error: `Failed to generate correct solution after ${attempts} attempts. Last error: ${lastError}`,
        attempts
    };
}

/**
 * Success! Now explain the code for the ghost typer.
 */
async function generateExplanationStep(
    solution: string,
    language: string,
    problemContext: string
): Promise<AISolutionResponse> {

    const explanationPrompt = `
    You have successfully solved the problem. Now, create a STEP-BY-STEP teaching script.
    
    The user will see the code being typed ("Ghost Typing") while reading your explanation.
    
    Format: Return a JSON object with:
    1. "steps": Array of { "time": number, "type": "explain" | "type", "text": string, "code": string }
    2. "concepts": Array of { "title": string, "type": "video" | "article" }
    
    Rules for Steps:
    1. FIRST STEP MUST BE 'explain': Introduce the solution.
    2. LINE-BY-LINE TEACHING: In your 'explain' steps, break down the code logic clearly (e.g., "Lines 1-3: We import Scanner...").
    3. STYLE: "Clean Code" only in 'type' steps (NO COMMENTS). The chat carried the explanation.
    4. TONE: Be an encouraging, interactive tutor.
    5. The "code" in 'type' steps MUST combine to form the EXACT solution provided below.

    Rules for Concepts:
    1. Identify 1-2 core computer science concepts used (e.g., "Greedy Algorithms", "Hash Maps", "Scanner Class").
    2. DO NOT provide a URL. Just provide the title and type (video or article). The system will generate guaranteed links.
    
    Solution:
    \`\`\`${language}
    ${solution}
    \`\`\`

    Problem Context:
    ${problemContext.substring(0, 20000)}...
    `;

    try {
        const { text } = await callGeminiAPI({
            contents: [{ parts: [{ text: explanationPrompt }] }],
            generationConfig: {
                maxOutputTokens: 8192,
                response_mime_type: "application/json"
            }
        });

        // Extract JSON
        let steps = [];
        let rawConcepts = [];
        let concepts: any[] = [];
        let parsed = null;

        try {
            // Strategy 1: Look for markdown code block
            const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
            if (codeBlockMatch) {
                parsed = JSON.parse(codeBlockMatch[1]);
            } else {
                // Strategy 2: Fallback to finding the first valid outer object
                // Using non-greedy match for the content between braces
                const jsonMatch = text.match(/(\{[\s\S]*\})/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[1]);
                }
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Last ditch: try to clean clean markup
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try { parsed = JSON.parse(cleanText); } catch (e2) { }
        }

        if (parsed) {
            steps = parsed.steps || [];
            rawConcepts = parsed.concepts || [];

            // Post-process concepts to guarantee valid links
            // 1. Try to match with curated "Source of Truth"
            // 2. Search Trusted Channels (WilliamFiset, Errichto, etc.)
            // 3. Fallback to Safe Search
            const processedConcepts = await Promise.all(rawConcepts.map(async (c: any) => {
                try {
                    const topicKey = normalizeTopic(c.title);
                    const verifiedTopic = topicKey ? VERIFIED_TOPICS[topicKey] : null;

                    let conceptUrl = '';
                    let type: 'video' | 'article' | 'youtube' = c.type || 'article';
                    let thumbnailUrl = ''; // Optional future support

                    // 1. Curated Content (Fastest & Best)
                    if (verifiedTopic) {
                        if (type === 'video' || (c.type as string) === 'youtube') {
                            const video = verifiedTopic.videos[0];
                            if (video) {
                                conceptUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                            } else {
                                // Fallback to article if no video in curated list
                                conceptUrl = verifiedTopic.articles[0]?.url || '';
                                type = 'article';
                            }
                        } else {
                            conceptUrl = verifiedTopic.articles[0]?.url || '';
                        }
                    }

                    // 2. Trusted Channel Search (Dynamic & Accurate)
                    if (!conceptUrl && (type === 'video' || type === 'youtube')) {
                        try {
                            const verifiedVideo = await getVerifiedVideo(c.title);
                            if (verifiedVideo) {
                                conceptUrl = verifiedVideo.url;
                                // We could also update the title to match the actual video title if we wanted
                                // c.title = verifiedVideo.title; 
                            }
                        } catch (e) {
                            console.error('Video search failed:', e);
                        }
                    }

                    // 3. Fallback to Generic Search (Last Resort - guaranteed no 404, but lower quality)
                    if (!conceptUrl) {
                        conceptUrl = type === 'video' || type === 'youtube'
                            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(c.title + ' tutorial')}`
                            : `https://www.google.com/search?q=${encodeURIComponent(c.title + ' programming tutorial')}`;
                    }

                    // Validation Layer for non-search URLs
                    let isValid = true;
                    if (!conceptUrl.includes('search_query') && !conceptUrl.includes('google.com/search')) {
                        const check = await validateLink(conceptUrl);
                        isValid = check.isValid;
                    }

                    if (!isValid) {
                        // Fallback to search if the direct link is dead
                        conceptUrl = `https://www.google.com/search?q=${encodeURIComponent(c.title + ' programming tutorial')}`;
                    }

                    return {
                        title: verifiedTopic ? verifiedTopic.title : c.title,
                        type: type,
                        url: conceptUrl
                    };
                } catch (error) {
                    console.error('Failed to process concept:', c, error);
                    // Return fallback search URL on error
                    return {
                        title: c.title || 'Unknown Concept',
                        type: c.type || 'article',
                        url: `https://www.google.com/search?q=${encodeURIComponent((c.title || 'programming') + ' tutorial')}`
                    };
                }
            }));

            concepts = processedConcepts;
        }

        // Fallback: If empty or no explanation first, inject one
        if (steps.length === 0 || steps[0].type !== 'explain') {
            steps.unshift({
                time: 0,
                type: 'explain',
                text: "I've found a solution! Let's break it down together. I'll type it out for you."
            });
        }

        if (steps.length === 1 && steps[0].type === 'explain') {
            // If AI only gave explanation but no code (rare failure), inject code
            steps.push({ time: 1, type: 'type', code: solution, position: 'end' });
        }

        return {
            success: true,
            solution,
            attempts: 1, // Reset for success count
            steps,
            concepts,
            verdict: 'Accepted'
        };

    } catch (error) {
        console.error("Failed to generate explanation:", error);
        // Fallback
        return {
            success: true,
            solution,
            attempts: 1,
            verdict: 'Accepted',
            steps: [
                { time: 0, type: 'explain', text: "I solved it! Here is the code." },
                { time: 1, type: 'type', code: solution, position: 'end' }
            ]
        };
    }
}
