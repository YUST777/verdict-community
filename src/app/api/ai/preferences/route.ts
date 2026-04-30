import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const user = await verifyAuth(req);
    // Return default preferences even if not logged in
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
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await req.json();
        // Mock save success
        return NextResponse.json({ success: true, message: 'Preferences saved (mock)' });
    } catch (_e) {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
}
