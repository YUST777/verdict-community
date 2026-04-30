import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { curriculum } from '@/lib/curriculum';

export async function GET(req: NextRequest) {
    try {
        // Try DB first
        let levels: any[] = [];
        try {
            const result = await query(
                `SELECT 
                    id, slug, name, description, level_number, 
                    duration_weeks, total_problems
                 FROM public.curriculum_levels
                 WHERE total_problems > 0
                 ORDER BY level_number ASC`
            );
            levels = result.rows.map(row => ({
                id: row.id,
                slug: row.slug,
                name: row.name,
                description: row.description,
                level_number: row.level_number,
                duration_weeks: row.duration_weeks,
                total_problems: row.total_problems
            }));
        } catch {
            // DB table may not exist yet
        }

        // Fallback to static curriculum data if DB is empty
        if (levels.length === 0) {
            levels = curriculum.map((level, index) => ({
                id: level.id,
                slug: level.slug,
                name: level.name,
                description: level.description,
                level_number: index,
                duration_weeks: level.durationWeeks,
                total_problems: level.totalProblems
            }));
        }

        return NextResponse.json({ levels });
    } catch (err) {
        console.error('Failed to fetch curriculum levels:', err);
        return NextResponse.json(
            { error: 'Failed to fetch curriculum levels' },
            { status: 500 }
        );
    }
}
