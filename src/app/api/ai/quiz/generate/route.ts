import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a strict but fair competitive programming tutor examining a student's understanding of their code.

Given the student's source code and the problem they solved, generate exactly 5 questions that test whether they TRULY understand their code.

Rules:
- Questions should go from easy to hard
- Q1-Q2: Ask what specific lines/blocks do (point to exact line numbers)
- Q3: Ask about the approach/algorithm choice
- Q4: Ask about time/space complexity
- Q5: Ask about edge cases or alternative approaches
- Each question should be 1-2 sentences max
- Reference specific line numbers when asking about code

Return ONLY a JSON array of objects with this exact format, no markdown, no explanation:
[
  {"q": "What does line 5 do?", "type": "line_explain", "line": 5, "difficulty": "easy"},
  {"q": "Why did you use a map here instead of an array?", "type": "reasoning", "difficulty": "medium"},
  ...
]`;

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!checkRateLimit(`quiz-gen:${user.id}`, 10, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
        }

        const { code, problemTitle, problemStatement } = await req.json();
        if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

        // Number the lines for reference
        const numberedCode = code.split('\n').map((line: string, i: number) => `${i + 1}: ${line}`).join('\n');

        const userPrompt = `Problem: ${problemTitle || 'Unknown'}
${problemStatement ? `\nStatement: ${problemStatement.substring(0, 500)}` : ''}

Student's code (with line numbers):
\`\`\`
${numberedCode}
\`\`\`

Generate 5 quiz questions about this code.`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }
                ],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
        }

        const questions = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, questions });
    } catch (err) {
        console.error('[quiz/generate]', err);
        return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
}
