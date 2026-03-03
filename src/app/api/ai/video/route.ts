import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseJson } from '@/lib/json-utils';
import { getSvgForKeywords } from '@/lib/svg-templates';
import mp3Duration from 'mp3-duration';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRes = await query('SELECT tts_video_count FROM public.users WHERE id = $1', [user.id]);
        const ttsCount = userRes.rows[0]?.tts_video_count || 0;

        if (ttsCount >= 3) {
            return NextResponse.json({ error: 'Free campaign limit reached (3/3 videos).' }, { status: 403 });
        }

        const {
            problemDescription,
            solution,
            language,
            settings
        } = await req.json();

        if (!settings?.apiKey) {
            return NextResponse.json({ error: 'LLM not configured' }, { status: 400 });
        }

        // Validate baseURL to prevent SSRF - only allow known LLM API hosts
        if (settings.baseURL) {
            try {
                const parsedUrl = new URL(settings.baseURL);
                const allowedHosts = [
                    'api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com',
                    'api.groq.com', 'openrouter.ai', 'api.together.xyz', 'api.fireworks.ai',
                    'api.mistral.ai', 'api.deepseek.com', 'api.cohere.ai'
                ];
                const isAllowed = allowedHosts.some(h => parsedUrl.hostname === h || parsedUrl.hostname.endsWith('.' + h));
                if (!isAllowed && !parsedUrl.hostname.endsWith('.openai.com')) {
                    return NextResponse.json({ error: 'Unsupported LLM provider URL' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid baseURL' }, { status: 400 });
            }
        }

        if (!problemDescription || !solution) {
            return NextResponse.json({ error: 'Missing problem description or solution' }, { status: 400 });
        }

        let systemPrompt = `You are a senior competitive programming educator with 10+ years of experience creating educational video walkthroughs (like NeetCode, Errichto, or 3Blue1Brown for CP). You produce PERFECT, structured video scripts that teach viewers how to solve competitive programming problems.

## YOUR TASK
Generate a video script as a JSON object with a "title" string and a "scenes" array. Follow the EXACT phase order below.

## PHASE ORDER (follow this STRICTLY)

### Phase 1 — Title (exactly 1 scene)
1. type: "title"
2. duration: 3
3. text: Problem name (max 6 words)
4. script: 1-sentence hook

### Phase 2 — Problem Statement (2-3 scenes)
1. type: "problem"
2. duration: 6-10
3. text: Short visual summary (MAX 6 WORDS). NOT the full problem text.
4. script: Conversational explanation of what the problem asks
5. svg: A raw SVG illustration (see SVG RULES below). REQUIRED for at least 1 problem scene.

### Phase 3 — Strategy / Key Insight (1-2 scenes)
1. type: "concept"
2. duration: 6-10
3. text: Core idea (MAX 8 WORDS — this renders at 56px and WILL OVERFLOW if longer)
4. script: Explain WHY this approach works
5. svg: A raw SVG illustration. REQUIRED for at least 1 concept scene.

### Phase 4 — Code Walkthrough (4-8 scenes)
1. type: "code"
2. duration: 5-10
3. text: What this section does (max 8 words)
4. script: Explain the highlighted lines
5. code: The FULL source code (IDENTICAL in every code scene)
6. highlight: [startLine, endLine] — 1-indexed, inclusive, PRECISE

### Phase 5 — Complexity & Summary (exactly 1 scene)
1. type: "summary"
2. duration: 5
3. text: "Time: O(...) | Space: O(...)"
4. script: Summarize efficiency. End on a high note.

## SVG RULES (CRITICAL — follow these EXACTLY)
- Use viewBox="0 0 400 300"
- Dark-mode: white strokes (#ffffff), #10b981 for highlights
- NO background fill on root <svg>
- ULTRA-MINIMALIST: use only 2-6 SVG elements. One or two shapes max.
- You MAY use <text> for SHORT labels (single letters/numbers like "N", "M", "A"). Style: fill="#ffffff" fill-opacity="0.6" font-size="16" font-family="monospace"
- Think: one clean rectangle with dimension labels. That's it. NO grids, NO dashed lines, NO complex patterns.

## TEXT LENGTH RULES (CRITICAL — strictly enforce these)
- title text: max 6 words
- problem text: MAX 6 WORDS (renders at 52px, overflows if longer!)
- concept text: MAX 6 WORDS (renders at 56px, overflows if longer!)
- code text: max 6 words
- summary text: max 8 words

## DURATION RULES
- Estimate ~3 words per second for script narration
- duration MUST be >= ceil(wordCount(script) / 3) + 2
- Never set duration shorter than what the script needs

## CODE SCENE RULES
- code field = COMPLETE source code, identical across ALL code scenes
- highlight = [start, end] 1-indexed inclusive line range you are explaining
- First code scene: highlight boilerplate/includes
- Last code scene: highlight output section
- Group related lines (e.g., input reading = lines 5-9)

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no backticks, no commentary.
{
  "title": "string",
  "scenes": [
    {
      "id": "string",
      "type": "title" | "problem" | "concept" | "code" | "summary",
      "duration": number,
      "text": "string (SHORT!)",
      "script": "string (narration)",
      "svg": "string (raw SVG, for problem/concept only)",
      "code": "string (full source, for code only)",
      "highlight": [number, number] (for code only)
    }
  ]
}

## COMPLETE EXAMPLE
Here is a COMPLETE, CORRECT example for a simple "Two Sum" problem:

{
  "title": "Two Sum",
  "scenes": [
    {
      "id": "title-1",
      "type": "title",
      "duration": 3,
      "text": "Two Sum",
      "script": "Let's solve the classic Two Sum problem step by step."
    },
    {
      "id": "problem-1",
      "type": "problem",
      "duration": 7,
      "text": "Find pair summing to target",
      "script": "Given an array of integers and a target value, we need to find two numbers that add up to the target and return their indices.",
      "svg": "<svg viewBox=\\"0 0 400 300\\" xmlns=\\"http://www.w3.org/2000/svg\"><rect x=\\"100\\" y=\\"80\\" width=\\"200\\" height=\\"140\\" fill=\\"none\\" stroke=\\"#ffffff\\" stroke-width=\\"1.5\\"/><text x=\\"200\\" y=\\"65\\" text-anchor=\\"middle\\" fill=\\"#ffffff\\" fill-opacity=\\"0.6\\" font-size=\\"16\\" font-family=\\"monospace\\">N</text><text x=\\"85\\" y=\\"155\\" text-anchor=\\"middle\\" fill=\\"#ffffff\\" fill-opacity=\\"0.6\\" font-size=\\"16\\" font-family=\\"monospace\\">M</text></svg>"
    },
    {
      "id": "concept-1",
      "type": "concept",
      "duration": 8,
      "text": "Hash map gives O(N)",
      "script": "Instead of checking every pair which would take O of N squared, we use a hash map. For each number, we check if the complement exists in the map. This gives us O of N time.",
      "svg": "<svg viewBox=\\"0 0 400 300\\" xmlns=\\"http://www.w3.org/2000/svg\"><rect x=\\"120\\" y=\\"80\\" width=\\"160\\" height=\\"140\\" fill=\\"none\\" stroke=\\"#10b981\\" stroke-width=\\"1.5\\" rx=\\"6\\"/><line x1=\\"120\\" y1=\\"120\\" x2=\\"280\\" y2=\\"120\\" stroke=\\"#ffffff\\" stroke-opacity=\\"0.15\\"/><line x1=\\"120\\" y1=\\"160\\" x2=\\"280\\" y2=\\"160\\" stroke=\\"#ffffff\\" stroke-opacity=\\"0.15\\"/></svg>"
    },
    {
      "id": "code-1",
      "type": "code",
      "duration": 6,
      "text": "Include headers and main",
      "script": "We start with the standard includes and the main function setup.",
      "code": "#include <bits/stdc++.h>\\nusing namespace std;\\nint main() {\\n    int n, target;\\n    cin >> n >> target;\\n    vector<int> a(n);\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    unordered_map<int,int> mp;\\n    for (int i = 0; i < n; i++) {\\n        int comp = target - a[i];\\n        if (mp.count(comp)) {\\n            cout << mp[comp] << \\" \\" << i << endl;\\n            return 0;\\n        }\\n        mp[a[i]] = i;\\n    }\\n    return 0;\\n}",
      "highlight": [1, 3]
    },
    {
      "id": "code-2",
      "type": "code",
      "duration": 8,
      "text": "Hash map lookup logic",
      "script": "For each element, we compute the complement by subtracting it from the target. If the complement exists in our hash map, we found our answer. Otherwise, we store the current element and its index.",
      "code": "#include <bits/stdc++.h>\\nusing namespace std;\\nint main() {\\n    int n, target;\\n    cin >> n >> target;\\n    vector<int> a(n);\\n    for (int i = 0; i < n; i++) cin >> a[i];\\n    unordered_map<int,int> mp;\\n    for (int i = 0; i < n; i++) {\\n        int comp = target - a[i];\\n        if (mp.count(comp)) {\\n            cout << mp[comp] << \\" \\" << i << endl;\\n            return 0;\\n        }\\n        mp[a[i]] = i;\\n    }\\n    return 0;\\n}",
      "highlight": [9, 16]
    },
    {
      "id": "summary-1",
      "type": "summary",
      "duration": 5,
      "text": "Time: O(N) | Space: O(N)",
      "script": "The hash map gives us O of N time and O of N space. One pass through the array is all we need."
    }
  ]
}

## FINAL REMINDERS (READ THESE CAREFULLY)
1. text fields MUST be SHORT. Concept text MAX 8 words. If you write more, the UI breaks.
2. Every problem and concept scene SHOULD have an svg field with a proper SVG illustration.
3. duration must be long enough for the script to be fully read (~3 words/sec + 2s buffer).`;

        const isArabic = settings.language === 'ar';
        if (isArabic) {
            systemPrompt += `\n\n## LANGUAGE RULE
You MUST write ALL "text" and "script" fields in Arabic (العربية). Use natural Arabic. The "code" field stays in the programming language. Field names ("id", "type", "duration") remain in English. CRITICAL FORMATTING: Whenever you mix English variables, numbers, mathematical formulas, or code constructs inside the Arabic text (in text/script fields), you MUST enclose them in markdown backticks (e.g. \`O(N)\` or \`10^5\`) so the Right-To-Left system renders them correctly inline. Example:
- text: "قراءة المدخلات وتهيئة المصفوفة ذات حجم \`N\`"
- script: "هنا بنقرأ الـ input من المستخدم ونحفظه في المصفوفة. الوقت المستغرق هو \`O(N)\`"
- code: stays as-is in C++/Python/etc

## FINAL REMINDERS (ARABIC)
1. text fields MUST be SHORT — MAX 8 words for concept scenes.
2. Every problem/concept scene SHOULD have an svg.
3. duration >= ceil(wordCount / 3) + 2.`;
        }

        const userPrompt = `Problem Description:
${problemDescription}

Solution Code (${language}):
${solution}

Generate the video script following the STRICT PHASE ORDER. Remember: code scenes must contain the FULL source code with precise highlight ranges.${isArabic ? ' ALL text and script fields MUST be in Arabic (العربية).' : ''}`;

        // ── LLM call with retry ─────────────────────────────────────────
        let parsed: Record<string, unknown> = { title: '', scenes: [] };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:])\/\/+/g, "$1/"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${settings.apiKey}`
                    },
                    body: JSON.stringify({
                        model: settings.model,
                        temperature: 0.4 + (attempt * 0.15), // Slightly increase temp on retry
                        response_format: { type: "json_object" },
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });

                if (!response.ok) {
                    const err = await response.text();
                    throw new Error(`LLM Failed: ${err}`);
                }

                const data = await response.json();
                const scriptJson = data.choices?.[0]?.message?.content;

                if (!scriptJson) {
                    throw new Error('Empty response from LLM');
                }

                parsed = extractAndParseJson(scriptJson);

                if (!parsed.title || !parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
                    throw new Error('Invalid script structure');
                }

                break; // Success, exit retry loop
            } catch (err: unknown) {
                lastError = err as Error;
                console.warn(`[Video Script] Attempt ${attempt + 1} failed:`, (err as Error).message);
                if (attempt === 1) throw lastError;
            }
        }

        // ── Text length limits per scene type ───────────────────────────
        const maxTextChars: Record<string, number> = {
            title: 40,
            problem: 80,
            concept: 50,
            code: 60,
            summary: 60,
        };

        // ── Find total lines of code for highlight clamping ─────────────
        // Use the LLM's own code field (from the first code scene) as the source
        // of truth, NOT the original solution. The LLM often reformats code with
        // different line counts, and clamping against the original solution's line
        // count truncates highlights (e.g. stuck at line 9 if original had 9 lines).
        const firstCodeScene = (parsed.scenes as Array<Record<string, unknown>>).find(
            (s: Record<string, unknown>) => s.type === 'code' && typeof s.code === 'string' && s.code.length > 0
        );
        const totalCodeLines = firstCodeScene
            ? (firstCodeScene.code as string).split('\n').length
            : (solution ? solution.split('\n').length : 999);

        // Validate and fix common issues
        const validTypes = ['title', 'problem', 'concept', 'code', 'summary'];
        parsed.scenes = (parsed.scenes as Array<Record<string, unknown>>)
            .filter((s: Record<string, unknown>) => s && validTypes.includes(s.type as string))
            .map((scene: Record<string, unknown>, idx: number) => {
                const scriptText = (scene.script as string) || '';
                const wordCount = scriptText.split(/\s+/).filter(Boolean).length;
                const minDurationForScript = Math.ceil(wordCount / 3) + 2;
                const rawDuration = (scene.duration as number) || 5;
                const finalDuration = Math.max(minDurationForScript, Math.max(2, Math.min(30, rawDuration)));

                let text = (scene.text as string) || '';
                const maxLen = maxTextChars[scene.type as string] || 80;
                if (text.length > maxLen) {
                    text = text.substring(0, maxLen).trim();
                    // Don't cut mid-word — find last space
                    const lastSpace = text.lastIndexOf(' ');
                    if (lastSpace > maxLen * 0.6) {
                        text = text.substring(0, lastSpace).trim();
                    }
                }

                // For code scenes, compute line count from this scene's own code field
                // to handle cases where different code scenes have slightly different code
                const sceneCodeLines = scene.type === 'code' && typeof scene.code === 'string'
                    ? (scene.code as string).split('\n').length
                    : totalCodeLines;

                return {
                    ...scene,
                    id: scene.id || `scene-${idx}`,
                    duration: finalDuration,
                    text,
                    script: scriptText,
                    // Auto-inject SVG fallback for problem/concept scenes without SVG
                    ...((scene.type === 'problem' || scene.type === 'concept') && !scene.svg ? {
                        svg: getSvgForKeywords(text + ' ' + scriptText)
                    } : {}),
                    // Ensure code scenes have required fields with highlight clamping
                    ...(scene.type === 'code' ? {
                        code: scene.code || '',
                        highlight: Array.isArray(scene.highlight) && scene.highlight.length === 2
                            ? [
                                Math.max(1, Math.min(sceneCodeLines, Math.min(scene.highlight[0], scene.highlight[1]))),
                                Math.max(1, Math.min(sceneCodeLines, Math.max(scene.highlight[0], scene.highlight[1])))
                            ]
                            : undefined
                    } : {})
                };
            });

        const ttsApiKey = process.env.GOOGLE_TTS_API_KEY;
        if (ttsApiKey) {
            const isArabic = settings?.language === 'ar';
            const voiceConfig = isArabic
                ? { languageCode: 'ar-XA', name: 'ar-XA-Standard-B', ssmlGender: 'MALE' }
                : { languageCode: 'en-US', name: 'en-US-Standard-A', ssmlGender: 'MALE' };

            parsed.scenes = await Promise.all(
                parsed.scenes.map(async (scene: any) => {
                    if (!scene.script) return scene;

                    // Strip markdown and punctuation that causes TTS to read symbols literally
                    const cleanScript = scene.script.replace(/[`*"\'?!\[\](){}_+]/g, '').replace(/-/g, ' ');

                    try {
                        const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                input: { text: cleanScript },
                                voice: voiceConfig,
                                audioConfig: { audioEncoding: 'MP3' }
                            })
                        });

                        if (ttsRes.ok) {
                            const data = await ttsRes.json();
                            if (data.audioContent) {
                                const buffer = Buffer.from(data.audioContent, 'base64');
                                const exactDuration = await mp3Duration(buffer);

                                return {
                                    ...scene,
                                    audioData: `data:audio/mp3;base64,${data.audioContent}`,
                                    // Add a generous 1.5s padding to the exact duration to ensure it doesn't cut off abruptly
                                    // and gives the viewer time to parse the visual text before switching scenes.
                                    duration: exactDuration + 1.5
                                };
                            }
                        } else {
                            console.error('[Google TTS API Error]', await ttsRes.text());
                        }
                    } catch (err) {
                        console.error('[Google TTS network error]', err);
                    }
                    return scene;
                })
            );
        }

        if (parsed.scenes.length === 0) {
            throw new Error('No valid scenes were generated');
        }

        await query('UPDATE public.users SET tts_video_count = COALESCE(tts_video_count, 0) + 1 WHERE id = $1', [user.id]);

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('[Video Script API Error]', error);
        return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
    }
}
