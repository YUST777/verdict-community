import { NextRequest, NextResponse } from 'next/server';

const BRIDGE_URL = process.env.SCRAPLING_BRIDGE_URL || 'http://verdict-scrapling-bridge:8787';

export async function GET(request: NextRequest) {
    try {
        // No auth check — jobId is a short-lived random UUID that acts as a bearer token.
        // The polling client uses bare fetch() without auth cookies.
        const jobId = request.nextUrl.searchParams.get('jobId');
        if (!jobId) {
            return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
        }

        const res = await fetch(`${BRIDGE_URL}/submit-result/${jobId}`, {
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            return NextResponse.json({ status: 'error', error: 'Job not found' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('[CF Submit Result] Error:', error.message || error);
        return NextResponse.json({ status: 'error', error: 'Internal error' }, { status: 500 });
    }
}
