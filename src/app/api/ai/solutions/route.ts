import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            problemId,
            contestId,
            problemIndex,
            problemName,
            problemRating,
            problemTags,
            solutionCode,
            language,
            solutionStyle,
            llmModel,
            llmProvider,
            thinking,
            approach,
            explanation,
            attempts,
            totalAttempts,
            successfulAttempt,
            totalWallTimeMs,
            hadReference,
            referenceCode,
        } = body;

        if (!problemId || !solutionCode || !language) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate attempts is an array
        if (attempts && !Array.isArray(attempts)) {
            return NextResponse.json({ error: 'attempts must be an array' }, { status: 400 });
        }

        await query(`
            INSERT INTO ai_solutions (
                problem_id, contest_id, problem_index, problem_name,
                problem_rating, problem_tags,
                solution_code, language, solution_style,
                llm_model, llm_provider,
                thinking, approach, explanation,
                attempts, total_attempts, successful_attempt,
                total_wall_time_ms,
                had_reference, reference_code,
                user_id
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6,
                $7, $8, $9,
                $10, $11,
                $12, $13, $14,
                $15, $16, $17,
                $18,
                $19, $20,
                $21
            )
        `, [
            problemId,
            contestId ? parseInt(contestId) : null,
            problemIndex || null,
            problemName || null,
            problemRating ? parseInt(problemRating) : null,
            problemTags || null,
            solutionCode,
            language,
            solutionStyle || 'smart',
            llmModel || null,
            llmProvider || null,
            thinking || null,
            approach || null,
            explanation || null,
            JSON.stringify(attempts || []),
            totalAttempts || 1,
            successfulAttempt || null,
            totalWallTimeMs || null,
            hadReference || false,
            referenceCode || null,
            user.id
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[AI Solutions POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
