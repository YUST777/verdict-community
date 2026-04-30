import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit } from '@/lib/simple-rate-limit';

// Avoid loading tokenizer packages at module load so Next.js build (Docker) does not pull in tiktoken_bg.wasm.
// All tokenizers are lazy-loaded inside the handler.

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // Rate limit tokenize requests
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(`tokenize:${ip}`, 30, 60)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await req.json();
        const { text, model } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ count: 0 });
        }

        const modelName = (model || 'gpt-3.5-turbo').toLowerCase();
        let tokenCount = 0;

        // 1. Gemini Models
        if (modelName.includes('gemini')) {
            const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
            if (apiKey) {
                try {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    // Map to a supported gemini model name for counting if an exact match fails
                    const genModel = genAI.getGenerativeModel({ model: modelName.includes('1.5') ? 'gemini-1.5-flash' : 'gemini-1.0-pro' });
                    const countResult = await genModel.countTokens(text);
                    tokenCount = countResult.totalTokens;
                } catch (e: unknown) {
                    console.error('[Gemini Tokenizer Error]', e instanceof Error ? e.message : e);
                    // Fallback to estimation below if API fails or rate limits
                }
            }
        }

        // 2. Claude / Anthropic Models
        else if (modelName.includes('claude')) {
            try {
                const AnthropicTokenizer = (await import('@anthropic-ai/tokenizer')).default;
                if (typeof (AnthropicTokenizer as { countTokens?: (t: string) => number }).countTokens === 'function') {
                    tokenCount = (AnthropicTokenizer as { countTokens: (t: string) => number }).countTokens(text);
                } else if (typeof (AnthropicTokenizer as { encode?: (t: string) => number[] }).encode === 'function') {
                    tokenCount = ((AnthropicTokenizer as { encode: (t: string) => number[] }).encode(text)).length;
                }
            } catch (e: unknown) {
                console.error('[Anthropic Tokenizer Error]', e instanceof Error ? e.message : e);
            }
        }

        // 3. Llama / Mistral Models
        else if (modelName.includes('llama') || modelName.includes('mistral') || modelName.includes('mixtral')) {
            try {
                const llamaTokenizer = (await import('llama-tokenizer-js')).default;
                tokenCount = llamaTokenizer.encode(text).length;
            } catch (e: unknown) {
                console.error('[Llama Tokenizer Error]', e instanceof Error ? e.message : e);
            }
        }

        // 4. OpenAI / Default (tiktoken) — lazy load to avoid WASM at build time
        if (tokenCount === 0) {
            try {
                const { encodingForModel } = await import('js-tiktoken');
                type TiktokenModel = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o';
                let tiktokenModel: TiktokenModel = 'gpt-3.5-turbo';
                if (modelName.includes('gpt-4o')) tiktokenModel = 'gpt-4o';
                else if (modelName.includes('gpt-4')) tiktokenModel = 'gpt-4';

                const enc = encodingForModel(tiktokenModel);
                tokenCount = enc.encode(text).length;
            } catch (e: unknown) {
                console.error('[js-tiktoken Error]', e instanceof Error ? e.message : e);
                // Absolute worst case estimation (approx 4 chars per token)
                tokenCount = Math.ceil(text.length / 4);
            }
        }

        return NextResponse.json({ count: tokenCount });

    } catch (error: unknown) {
        console.error('[API Tokenize Error]', error);
        return NextResponse.json({ error: 'Failed to tokenize text' }, { status: 500 });
    }
}
