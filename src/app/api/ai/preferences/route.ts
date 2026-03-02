import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
    // Return default preferences
    return NextResponse.json({
        preferences: {
            language: 'cpp',
            verbosity: 'detailed',
            theme: 'dark'
        }
    });

}

export async function POST(req: NextRequest) {
    try {
        await req.json();
        // Mock save success
        return NextResponse.json({ success: true, message: 'Preferences saved (mock)' });
    } catch (_e) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
}
