/**
 * AI API Client with Key Rotation and IP Rate Limit Mitigation
 * Handles API calls with automatic key rotation, fallback, and IP protection
 */

import { getAvailableAPIKey, markKeyUnavailable } from './ai-key-rotation';
import { throttledFetch, retryWithBackoff } from './ip-rate-limit-mitigation';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const PAID_TIER_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiRequest {
    contents: Array<{
        parts: Array<{ text: string }>;
    }>;
    generationConfig?: {
        temperature?: number;
        topK?: number;
        topP?: number;
        maxOutputTokens?: number;
        response_mime_type?: string;
    };
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    usageMetadata?: any;
}

/**
 * Make a Gemini API call with automatic key rotation
 */
export async function callGeminiAPI(
    requestBody: GeminiRequest,
    retries = 2
): Promise<{ text: string; usage?: any; keyUsed: string }> {
    let apiKey = getAvailableAPIKey();
    let usingFreeTier = true;

    // If no free key available, use paid tier
    if (!apiKey) {
        apiKey = PAID_TIER_API_KEY || null;
        usingFreeTier = false;

        if (!apiKey) {
            throw new Error('No API keys available');
        }
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Use throttled fetch to prevent IP rate limiting
            // Priority: Higher for paid tier, lower for free tier
            const priority = usingFreeTier ? 0 : 1;

            const response = await throttledFetch(
                `${GEMINI_API_URL}?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                },
                priority
            );

            if (response.ok) {
                const data: GeminiResponse = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

                return {
                    text,
                    usage: data.usageMetadata,
                    keyUsed: usingFreeTier ? 'free-tier' : 'paid-tier'
                };
            }

            // Handle rate limit errors
            if (response.status === 429) {
                if (usingFreeTier) {
                    markKeyUnavailable(apiKey, 'Rate limit exceeded');

                    // Try to get another free key
                    const nextKey = getAvailableAPIKey();
                    if (nextKey && attempt < retries) {
                        apiKey = nextKey;
                        continue; // Retry with different key
                    }
                }

                // If no free keys left or paid tier also rate limited, fallback to paid tier
                if (PAID_TIER_API_KEY && !usingFreeTier && attempt < retries) {
                    // Already using paid tier, wait a bit and retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                } else if (PAID_TIER_API_KEY && usingFreeTier && attempt < retries) {
                    // Fallback to paid tier
                    apiKey = PAID_TIER_API_KEY;
                    usingFreeTier = false;
                    continue;
                }
            }

            // For other errors, throw
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);

        } catch (error) {
            if (attempt === retries) {
                throw error;
            }

            // If it's a network error and we have retries left, try paid tier
            if (usingFreeTier && PAID_TIER_API_KEY && attempt < retries) {
                apiKey = PAID_TIER_API_KEY;
                usingFreeTier = false;
                continue;
            }

            throw error;
        }
    }

    throw new Error('Failed to get response after retries');
}
