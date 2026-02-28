import { NextRequest, NextResponse } from 'next/server';
import { extractAndParseJson } from '@/lib/json-utils';

export async function POST(req: NextRequest) {
    try {
        const {
            problemDescription,
            solution,
            language,
            settings
        } = await req.json();

        if (!settings?.apiKey) {
            return NextResponse.json({ error: 'LLM not configured' }, { status: 400 });
        }

        if (!problemDescription || !solution) {
            return NextResponse.json({ error: 'Missing problem description or solution' }, { status: 400 });
        }

        let systemPrompt = `You are a world-class Competitive Programming video creator (like NeetCode, Errichto, or 3Blue1Brown for CP). Your goal: generate a PERFECT video script that teaches the viewer how to solve a competitive programming problem.

## STRICT SCENE FLOW (follow this EXACT order)

### Phase 1 — Title (1 scene)
- type: "title"
- duration: 3 (seconds)
- text: The problem name (short, punchy, max 6 words)
- script: A 1-sentence hook. Example: "Let's break down this classic problem step by step."

### Phase 2 — Problem Statement (2-4 scenes)
Read the problem to the viewer. Break it into digestible chunks:
- type: "problem"
- duration: 5-8 each
- text: A SHORT visual summary of what this part says (max 15 words). NOT the full problem text.
- script: A natural, conversational explanation of what the problem is asking. Read it like you're explaining to a friend. Cover: what the input looks like, what the output should be, any key constraints (like N ≤ 10^5).
- svg: (Optional) A raw SVG string to visually illustrate the problem. Use viewBox="0 0 400 300". Use dark-mode friendly colors (white/gray strokes, no background, #10b981 for highlights). NO text in SVG, only shapes/lines.

### Phase 3 — Strategy / Key Insight (1-3 scenes)
Explain the algorithmic approach BEFORE showing code:
- type: "concept"
- duration: 5-8 each
- text: The core idea in a short phrase (max 12 words). Example: "Use a sliding window of size K"
- script: Explain WHY this approach works. What is the key insight? Why is brute force too slow? What data structure helps?
- svg: (Optional) A raw SVG string to visually illustrate the algorithm (e.g., an array, a graph, a tree). Use dark-mode friendly colors (#3b82f6 or #10b981).

### Phase 4 — Code Walkthrough (5-12 scenes)
Walk through the solution code section by section. NOT line-by-line for trivial lines — group logically related lines together:
- type: "code"
- duration: 5-10 each
- text: What this code section does (max 10 words). Example: "Reading input and initializing arrays"
- script: Explain what the highlighted lines do and WHY. Connect back to the strategy.
- code: The FULL source code (IDENTICAL across ALL code scenes — the viewer sees the same file, with different highlights)
- highlight: [startLine, endLine] — 1-indexed, inclusive. MUST match the lines you're explaining. Be PRECISE.

Guidelines for code scenes:
- First code scene: highlight the includes/boilerplate (lines 1-4 typically)
- Group related lines (e.g., "input reading" = lines 5-9)
- For the core algorithm, you may use 1-3 lines per scene for precision
- Last code scene: highlight the output section
- NEVER have a code scene without a highlight

### Phase 5 — Complexity & Summary (1 scene)
- type: "summary"
- duration: 5
- text: "Time: O(...) | Space: O(...)" — the complexity
- script: Summarize why the solution is efficient and correct. End on a high note.

## RULES

1. **script** field = what the narrator SAYS (natural, educational, conversational). This becomes TTS audio AND on-screen captions.
2. **text** field = what appears as the VISUAL headline on screen. Keep it SHORT and punchy.
3. Code scenes MUST have the COMPLETE source code in the "code" field. Every code scene shares the SAME full code — only the highlight changes.
4. highlight ranges MUST be precise 1-indexed [start, end] inclusive line numbers.
5. Total video should be 60-120 seconds (aim for ~90s).
6. Scene durations should vary (3-10s) for natural pacing.
7. IDs must be unique strings (e.g., "title-1", "problem-1", "concept-1", "code-1", etc.)
8. Do NOT use emojis in the script field.
9. The script should sound natural when read aloud by a TTS engine.

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no backticks, no explanation outside JSON.
{
  "title": "Problem Title",
  "scenes": [
    {
      "id": "unique-string-id",
      "type": "title" | "problem" | "concept" | "code" | "summary",
      "duration": number,
      "text": "Short visual headline",
      "script": "Natural narration text for TTS",
      "svg": "<svg viewBox=\"0 0 400 300\">...</svg> (optional, only for problem/concept)",
      "code": "Full source code (only for code scenes)",
      "highlight": [startLine, endLine] (only for code scenes)
    }
  ]
}`;

        const isArabic = settings.language === 'ar';
        if (isArabic) {
            systemPrompt += `\n\n## LANGUAGE RULE\nYou MUST write ALL "text" and "script" fields in Arabic (العربية). Use natural Arabic. The "code" field stays in the programming language. Field names ("id", "type", "duration") remain in English. Example:\n- text: "قراءة المدخلات وتهيئة المصفوفة"\n- script: "هنا بنقرأ الـ input من المستخدم ونحفظه في المصفوفة"\n- code: stays as-is in C++/Python/etc`;
        }

        const userPrompt = `Problem Description:
${problemDescription}

Solution Code (${language}):
${solution}

Generate the video script following the STRICT SCENE FLOW. Remember: code scenes must contain the FULL source code with precise highlight ranges.${isArabic ? ' ALL text and script fields MUST be in Arabic (العربية).' : ''}`;

        const response = await fetch(`${settings.baseURL}/chat/completions`.replace(/([^:])\/\/+/g, "$1/"), {
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
            const err = await response.text();
            throw new Error(`LLM Failed: ${err}`);
        }

        const data = await response.json();
        const scriptJson = data.choices?.[0]?.message?.content;

        if (!scriptJson) {
            throw new Error('Empty response from LLM');
        }

        const parsed = extractAndParseJson(scriptJson);

        // ── Post-processing validation ──────────────────────────────────
        if (!parsed.title || !parsed.scenes || !Array.isArray(parsed.scenes)) {
            throw new Error('Invalid script structure: missing title or scenes array');
        }

        // Validate and fix common issues
        const validTypes = ['title', 'problem', 'concept', 'code', 'summary'];
        parsed.scenes = parsed.scenes
            .filter((s: any) => s && validTypes.includes(s.type))
            .map((scene: any, idx: number) => ({
                ...scene,
                id: scene.id || `scene-${idx}`,
                duration: Math.max(2, Math.min(15, scene.duration || 5)),
                text: scene.text || '',
                script: scene.script || '',
                // Ensure code scenes have required fields
                ...(scene.type === 'code' ? {
                    code: scene.code || '',
                    highlight: Array.isArray(scene.highlight) && scene.highlight.length === 2
                        ? [Math.max(1, scene.highlight[0]), Math.max(1, scene.highlight[1])]
                        : undefined
                } : {})
            }));

        if (parsed.scenes.length === 0) {
            throw new Error('No valid scenes were generated');
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('[Video Script API Error]', error);
        return NextResponse.json({ error: error.message || 'Failed to generate script' }, { status: 500 });
    }
}
