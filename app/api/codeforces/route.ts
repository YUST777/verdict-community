
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const contestId = searchParams.get('contestId');
    const problemId = searchParams.get('problemId');

    if (!contestId || !problemId) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const targetUrl = `https://codeforces.com/contest/${contestId}/problem/${problemId}`;

    // NOTE: In a real production environment, you would use a microservice or 
    // ensure Puppeteer is installed in the container.
    // Here we point to the local Mirror script for demo purposes.
    const scriptPath = path.resolve(process.cwd(), '../Mirror/cli_fetch.js');

    try {
        const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${targetUrl}"`);

        // Pass stderr to console for debugging but return stdout to user
        if (stderr) console.error('Puppeteer Stderr:', stderr);

        return new NextResponse(stdout, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (error) {
        console.error('Scraping Error:', error);
        return NextResponse.json({ error: 'Failed to fetch problem', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
