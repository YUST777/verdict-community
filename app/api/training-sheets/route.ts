import { NextRequest, NextResponse } from 'next/server';
import { getAllSheets } from '@/lib/problems';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const sheets = getAllSheets();

        return NextResponse.json({
            success: true,
            sheets: sheets.map(sheet => ({
                id: sheet.id,
                title: sheet.title,
                description: sheet.description,
                totalProblems: sheet.totalProblems,
            }))
        });
    } catch (error) {
        console.error('Error fetching training sheets:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
