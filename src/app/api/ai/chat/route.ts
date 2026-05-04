import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/simple-rate-limit';

/**
 * POST /api/ai/chat
 * Server-side AI proxy that supports multiple providers:
 * - OpenAI-compatible (OpenAI, OpenRouter, Gemini OpenAI mode)
 * - Anthropic-compatible (Anthropic, AgentRouter)
 * - Built-in Gemini fallback (no user key needed)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;

// Detect provider from base URL
function detectProvider(baseURL: string): 'openai' | 'anthropic' | 'gemini' {
    const url = baseURL.toLowerCase();
    if (url.includes('anthropic') || url.includes('agentrouter')) return 'anthropic';
    if (url.includes('generativelanguage.googleapis.com') || url.includes('gemini')) return 'gemini';
    return 'openai';
}

// Convert OpenAI messages to Anthropic format
function toAnthropicMessages(messages: any[]) {
    const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const msgs = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
    }));
    return { system, messages: msgs };
}

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!checkRateLimit(`ai-chat:${user.id}`, 30, 60)) {
            return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch (parseErr) {
            console.error('[ai/chat] Failed to parse request body:', parseErr);
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }
        const { messages, model, baseURL, apiKey, tools, tool_choice } = body;

        if (!messages || !Array.isArray(messages)) {
            console.error('[ai/chat] Invalid messages field:', typeof messages, messages);
            return NextResponse.json({ error: 'Messages required' }, { status: 400 });
        }

        const finalApiKey = apiKey || DEFAULT_OPENAI_API_KEY;
        const finalBaseURL = baseURL || DEFAULT_OPENAI_BASE_URL;

        // If no user key and no default, use built-in Gemini
        const useBuiltIn = !finalApiKey || !finalBaseURL;
        
        if (useBuiltIn) {
            if (!GEMINI_API_KEY) {
                return NextResponse.json({ error: 'AI not configured. Please set up your LLM in AI Settings.' }, { status: 503 });
            }

            // Use Gemini API directly
            // Extract system instruction first
            const systemMsg = messages.find((m: any) => m.role === 'system');
            const nonSystemMsgs = messages.filter((m: any) => m.role !== 'system');

            // Map to Gemini format
            const geminiMessages = nonSystemMsgs.map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

            // Gemini requires alternating user/model turns — merge consecutive same-role messages
            const mergedMessages: any[] = [];
            for (const msg of geminiMessages) {
                if (mergedMessages.length > 0 && mergedMessages[mergedMessages.length - 1].role === msg.role) {
                    // Merge into previous message
                    mergedMessages[mergedMessages.length - 1].parts.push({ text: msg.parts[0].text });
                } else {
                    mergedMessages.push({ ...msg, parts: [...msg.parts] });
                }
            }

            // Ensure first message is from user (Gemini requirement)
            if (mergedMessages.length > 0 && mergedMessages[0].role !== 'user') {
                mergedMessages.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
            }

            const geminiBody: any = {
                contents: mergedMessages,
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
            };
            if (systemMsg) {
                geminiBody.systemInstruction = { parts: [{ text: systemMsg.content }] };
            }

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geminiBody),
                }
            );

            if (!geminiRes.ok) {
                const err = await geminiRes.text();
                console.error('[ai/chat] Gemini error:', geminiRes.status, err);
                if (geminiRes.status === 429) {
                    return NextResponse.json({ error: 'Gemini API quota exceeded. Please configure your own LLM key in AI Settings.' }, { status: 429 });
                }
                return NextResponse.json({ error: 'AI service error' }, { status: 502 });
            }

            const geminiData = await geminiRes.json();
            const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

            // Return in OpenAI format so the client doesn't need to change
            return NextResponse.json({
                choices: [{ message: { role: 'assistant', content } }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            });
        }

        // User-provided key (or default) — detect provider and proxy
        const provider = detectProvider(finalBaseURL);

        if (provider === 'anthropic') {
            // Anthropic format
            const { system, messages: anthropicMsgs } = toAnthropicMessages(messages);
            const anthropicURL = finalBaseURL.replace(/\/+$/, '') + '/v1/messages';

            const res = await fetch(anthropicURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': finalApiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: model || 'claude-sonnet-4-5-20250514',
                    max_tokens: 4096,
                    system,
                    messages: anthropicMsgs,
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error('[ai/chat] Anthropic error:', err);
                return NextResponse.json({ error: 'AI provider error' }, { status: res.status });
            }

            const data = await res.json();
            const content = data.content?.[0]?.text || '';

            return NextResponse.json({
                choices: [{ message: { role: 'assistant', content } }],
                usage: {
                    prompt_tokens: data.usage?.input_tokens || 0,
                    completion_tokens: data.usage?.output_tokens || 0,
                    total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
                },
            });
        }

        // OpenAI-compatible (default)
        const openaiURL = finalBaseURL.replace(/\/+$/, '') + '/chat/completions';
        const res = await fetch(openaiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${finalApiKey}`,
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages,
                ...(tools ? { tools, tool_choice: tool_choice || 'auto' } : {}),
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[ai/chat] OpenAI error:', err);
            return NextResponse.json({ error: 'AI provider error' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error('[ai/chat] Error:', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
