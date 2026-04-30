import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const user = await verifyAuth(req);
        if (!user) return NextResponse.json({ streak: 0 });

        // Count consecutive days with submissions ending today/yesterday
        const result = await query(
            `WITH daily AS (
                SELECT DISTINCT DATE(submitted_at) as day
                FROM training_submissions
                WHERE user_id = $1
            ),
            numbered AS (
                SELECT day, 
                       day - (ROW_NUMBER() OVER (ORDER BY day))::int * INTERVAL '1 day' AS grp
                FROM daily
            ),
            streaks AS (
                SELECT grp, MIN(day) as start_day, MAX(day) as end_day, COUNT(*) as streak_len
                FROM numbered
                GROUP BY grp
            )
            SELECT streak_len as streak
            FROM streaks
            WHERE end_day >= CURRENT_DATE - INTERVAL '1 day'
            ORDER BY end_day DESC
            LIMIT 1`,
            [user.id]
        );

        const streak = result.rows?.[0]?.streak ? parseInt(result.rows[0].streak) : 0;
        return NextResponse.json({ streak });
    } catch {
        return NextResponse.json({ streak: 0 });
    }
}
