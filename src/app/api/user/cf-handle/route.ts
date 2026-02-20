import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    // Mock for unauthenticated (since auth fails currently)
    return NextResponse.json({ success: true, handle: null });
}
