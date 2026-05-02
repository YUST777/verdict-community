import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Clear all auth-related cookies
    const allCookies = req.cookies.getAll();
    allCookies.forEach(cookie => {
        if (cookie.name.startsWith('sb-') || cookie.name === 'authToken') {
            response.cookies.delete(cookie.name);
        }
    });

    return response;
}
