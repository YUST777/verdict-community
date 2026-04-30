import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a strict competitive programming tutor evaluating a student's answer.

Be honest and direct:
- If the answer is correct and shows understanding, say so briefly
- If the answer is vague or partially correct, explain what's missing
- If the answer is wrong, correct them firmly but helpfully
- Don't accept "it just works" or vague hand-waving

Return ONLY a JSON object with this exact format, no markdown:
{
  "rating": "good" | "partial" | "weak",
  "feedback": "Your evaluation in 1-3 sentences",
  "correctAnswer": "Brief correct explanation if they got it wrong"
}`;

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!checkRateLimit(`quiz-eval:${user.id}`, 30, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
        }

        const { code, question, answer, problemTitle } = await req.json();
        if (!question || !answer) {
            return NextResponse.json({ error: 'Question and answer required' }, { status: 400 });
        }

        const numberedCode = code?.split('\n').map((line: string, i: number) => `${i + 1}: ${line}`).join('\n') || '';

        const userPrompt = `Problem: ${problemTitle || 'Unknown'}

Code:
\`\`\`
${numberedCode}
\`\`\`

Question: ${question}
Student's answer: ${answer}

Evaluate this answer.`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }
                ],
                generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
            }),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'AI service error' }, { status: 502 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Failed to evaluate' }, { status: 500 });
        }

        const evaluation = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, ...evaluation });
    } catch (err) {
        console.error('[quiz/evaluate]', err);
        return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 });
    }
}
