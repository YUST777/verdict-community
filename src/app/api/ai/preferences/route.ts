import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
        const body = await req.json();
        // Mock save success
        return NextResponse.json({ success: true, message: 'Preferences saved (mock)' });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
}
