import { NextRequest, NextResponse } from 'next/server';
import { encodingForModel, TiktokenModel } from 'js-tiktoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore - Some tokenizer packages lack perfect type definitions
import AnthropicTokenizer from '@anthropic-ai/tokenizer';
import llamaTokenizer from 'llama-tokenizer-js';

// Cache for anthropic tokenizer to avoid repeated initialization if possible
let anthropicTokenizerInstance: any = null;

export async function POST(req: NextRequest) {
    try {
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
                } catch (e: any) {
                    console.error('[Gemini Tokenizer Error]', e.message);
                    // Fallback to estimation below if API fails or rate limits
                }
            }
        }

        // 2. Claude / Anthropic Models
        else if (modelName.includes('claude')) {
            try {
                if (!anthropicTokenizerInstance) {
                    // Initialization can be slightly heavy
                    anthropicTokenizerInstance = AnthropicTokenizer;
                }
                // @anthropic-ai/tokenizer provides a countTokens method or an encode method depending on version
                if (anthropicTokenizerInstance.countTokens) {
                    tokenCount = anthropicTokenizerInstance.countTokens(text);
                } else if (anthropicTokenizerInstance.encode) {
                    tokenCount = anthropicTokenizerInstance.encode(text).length;
                }
            } catch (e: any) {
                console.error('[Anthropic Tokenizer Error]', e.message);
            }
        }

        // 3. Llama / Mistral Models (Often use standard sentencepiece or llama tokenizers)
        else if (modelName.includes('llama') || modelName.includes('mistral') || modelName.includes('mixtral')) {
            try {
                tokenCount = llamaTokenizer.encode(text).length;
            } catch (e: any) {
                console.error('[Llama Tokenizer Error]', e.message);
            }
        }

        // 4. OpenAI / Default (tiktoken)
        if (tokenCount === 0) { // Fallback applies to OpenAI, unknown models, or if specific tokenizers threw errors
            try {
                // OpenAI models map exactly, others map to gpt-4 or cl100k_base for estimation
                let tiktokenModel: TiktokenModel = 'gpt-3.5-turbo';
                if (modelName.includes('gpt-4o')) tiktokenModel = 'gpt-4o';
                else if (modelName.includes('gpt-4')) tiktokenModel = 'gpt-4';

                const enc = encodingForModel(tiktokenModel);
                tokenCount = enc.encode(text).length;
            } catch (e: any) {
                console.error('[js-tiktoken Error]', e.message);
                // Absolute worst case estimation (approx 4 chars per token)
                tokenCount = Math.ceil(text.length / 4);
            }
        }

        return NextResponse.json({ count: tokenCount });

    } catch (error: any) {
        console.error('[API Tokenize Error]', error);
        return NextResponse.json({ error: 'Failed to tokenize text' }, { status: 500 });
    }
}
