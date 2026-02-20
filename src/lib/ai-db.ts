
import { query } from '@/lib/db';
import { AILearningPreferences } from '@/lib/ai-personalization';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    codeBlock?: {
        code: string;
        language: string;
        lineReference?: string;
    };
}

/**
 * Fetch chat history for a specific problem and user
 */
export async function getAIChatHistory(userId: string | number, contestId: string, problemId: string): Promise<AIMessage[]> {
    if (!userId) return [];

    // Normalize IDs
    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;
    const fullProblemId = `${safeContestId}-${safeProblemId}`;

    // 1. Get Conversation ID
    const convResult = await query(
        'SELECT id FROM ai_conversations WHERE user_id = $1 AND problem_id = $2',
        [userId, fullProblemId]
    );

    if (convResult.rows.length === 0) return [];

    const conversationId = convResult.rows[0].id;

    // 2. Get Messages
    const msgsResult = await query(
        'SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [conversationId]
    );

    return msgsResult.rows.map(msg => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
        codeBlock: msg.has_code_block ? {
            code: msg.code_block_content,
            language: msg.code_block_language || 'cpp',
            lineReference: msg.selected_line_reference
        } : undefined
    }));
}

/**
 * Save a new user or assistant message
 */
export async function saveAIMessage(
    userId: string | number,
    contestId: string,
    problemId: string,
    message: Omit<AIMessage, 'id' | 'timestamp'>,
    problemContext?: { title: string; language: string; }
): Promise<string | null> {
    if (!userId) {
        console.error('[AI DB] saveAIMessage: No userId provided.');
        return null;
    }

    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
    const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;
    const fullProblemId = `${safeContestId}-${safeProblemId}`;

    try {
        // 1. Find or Create Conversation
        let conversationId: string;

        const convResult = await query(
            'SELECT id FROM ai_conversations WHERE user_id = $1 AND problem_id = $2',
            [userId, fullProblemId]
        );

        if (convResult.rows.length > 0) {
            conversationId = convResult.rows[0].id;
        } else {
            // Create new
            const newConvResult = await query(
                `INSERT INTO ai_conversations (user_id, contest_id, problem_id, problem_title, language)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [
                    userId,
                    safeContestId,
                    fullProblemId,
                    problemContext?.title || 'Unknown Problem',
                    problemContext?.language || 'cpp'
                ]
            );

            if (newConvResult.rows.length === 0) {
                console.error('[AI DB] Failed to create conversation');
                return null;
            }
            conversationId = newConvResult.rows[0].id;
        }

        // 2. Insert Message
        const msgResult = await query(
            `INSERT INTO ai_messages (
                conversation_id, role, content, has_code_block, 
                code_block_content, code_block_language, selected_line_reference, language
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [
                conversationId,
                message.role,
                message.content,
                !!message.codeBlock,
                message.codeBlock?.code || null,
                message.codeBlock?.language || null,
                message.codeBlock?.lineReference || null,
                problemContext?.language || 'cpp'
            ]
        );

        if (msgResult.rows.length === 0) {
            console.error('[AI DB] Failed to save message');
            return null;
        }

        return msgResult.rows[0].id.toString();

    } catch (err) {
        console.error('[AI DB] Error saving message:', err);
        return null;
    }
}

/**
 * Load user AI preferences
 */
export async function getUserAIPreferences(userId: string | number): Promise<Partial<AILearningPreferences>> {
    if (!userId) return {};

    try {
        const result = await query(
            'SELECT * FROM ai_user_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) return {};

        const data = result.rows[0];

        // Map DB fields to AILearningPreferences
        return {
            skillLevel: data.skill_level,
            learningStyle: data.learning_style,
            explanationDepth: data.explanation_depth,
            preferredLanguage: data.preferred_language,
            preferredExplanationFormat: data.preferred_explanation_format,
            includeComplexityAnalysis: data.include_complexity_analysis,
            includeOptimizationTips: data.include_optimization_tips,
            includeCommonMistakes: data.include_common_mistakes,
            useExamples: data.use_examples,
            preferredTone: data.preferred_tone,
            useExpertMode: data.use_expert_mode,
            focusAreas: data.focus_areas || []
        };
    } catch (err) {
        console.error('[AI DB] Error fetching preferences:', err);
        return {};
    }
}

/**
 * Save user AI preferences
 */
export async function saveUserAIPreferences(userId: string | number, prefs: Partial<AILearningPreferences>): Promise<boolean> {
    if (!userId) return false;

    try {
        // Upsert preferences
        // Postgres UPSERT syntax: INSERT ... ON CONFLICT DO UPDATE
        await query(
            `INSERT INTO ai_user_preferences (
                user_id, skill_level, learning_style, explanation_depth, preferred_language,
                preferred_explanation_format, include_complexity_analysis, include_optimization_tips,
                include_common_mistakes, use_examples, preferred_tone, use_expert_mode, focus_areas, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                skill_level = EXCLUDED.skill_level,
                learning_style = EXCLUDED.learning_style,
                explanation_depth = EXCLUDED.explanation_depth,
                preferred_language = EXCLUDED.preferred_language,
                preferred_explanation_format = EXCLUDED.preferred_explanation_format,
                include_complexity_analysis = EXCLUDED.include_complexity_analysis,
                include_optimization_tips = EXCLUDED.include_optimization_tips,
                include_common_mistakes = EXCLUDED.include_common_mistakes,
                use_examples = EXCLUDED.use_examples,
                preferred_tone = EXCLUDED.preferred_tone,
                use_expert_mode = EXCLUDED.use_expert_mode,
                focus_areas = EXCLUDED.focus_areas,
                updated_at = NOW()`,
            [
                userId,
                prefs.skillLevel ?? null,
                prefs.learningStyle ?? null,
                prefs.explanationDepth ?? null,
                prefs.preferredLanguage ?? null,
                prefs.preferredExplanationFormat ?? null,
                prefs.includeComplexityAnalysis ?? null,
                prefs.includeOptimizationTips ?? null,
                prefs.includeCommonMistakes ?? null,
                prefs.useExamples ?? null,
                prefs.preferredTone ?? null,
                prefs.useExpertMode ?? null,
                prefs.focusAreas ?? null
            ]
        );
        return true;
    } catch (err) {
        console.error('[AI DB] Failed to save preferences:', err);
        return false;
    }
}
