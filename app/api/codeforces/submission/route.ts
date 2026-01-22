import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CFSubmission {
    id: number;
    verdict?: string;
    passedTestCount?: number;
    timeConsumedMillis?: number;
    memoryConsumedBytes?: number;
}

// Map CF API verdict to display format
function mapVerdict(verdict: string | undefined): string {
    if (!verdict) return 'In queue';
    const map: Record<string, string> = {
        'OK': 'Accepted',
        'WRONG_ANSWER': 'Wrong Answer',
        'TIME_LIMIT_EXCEEDED': 'Time Limit Exceeded',
        'MEMORY_LIMIT_EXCEEDED': 'Memory Limit Exceeded',
        'RUNTIME_ERROR': 'Runtime Error',
        'COMPILATION_ERROR': 'Compilation Error',
        'TESTING': 'Testing',
        'CHALLENGED': 'Challenged',
        'SKIPPED': 'Skipped',
        'PARTIAL': 'Partial',
        'IDLENESS_LIMIT_EXCEEDED': 'Idleness Limit Exceeded'
    };
    return map[verdict] || verdict;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get('handle');
    const submissionId = searchParams.get('submissionId');
    const contestId = searchParams.get('contestId');

    if (!submissionId) {
        return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
    }

    try {
        // Method 1: If we have a handle, use the official CF API
        if (handle) {
            const apiUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=20`;
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Verdict/1.0 (Compatible; Competitive Programming Tool)',
                    'Accept': 'application/json'
                },
                next: { revalidate: 0 }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'OK' && data.result) {
                    const submission = data.result.find((s: CFSubmission) => s.id == Number(submissionId));
                    if (submission) {
                        const verdict = mapVerdict(submission.verdict);
                        const waiting = !submission.verdict || submission.verdict === 'TESTING';

                        return NextResponse.json({
                            found: true,
                            success: true,
                            verdict,
                            waiting,
                            testNumber: submission.passedTestCount || 0,
                            time: submission.timeConsumedMillis,
                            memory: Math.round((submission.memoryConsumedBytes || 0) / 1024),
                            submissionId: submission.id,
                            rawVerdict: submission.verdict
                        });
                    }
                }
            }
        }

        // Method 2: Scrape submission page directly (works without handle)
        if (contestId) {
            const pageUrl = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
            const response = await fetch(pageUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html'
                },
                next: { revalidate: 0 }
            });

            if (response.ok) {
                const html = await response.text();
                
                // Check for active states
                const inQueue = html.includes('In queue') || html.includes('in queue');
                const runningMatch = html.match(/Running on test (\d+)/);
                
                let verdict = 'In queue';
                let waiting = true;
                let testNumber = 0;
                
                if (runningMatch) {
                    verdict = 'Testing';
                    testNumber = parseInt(runningMatch[1]);
                } else if (inQueue) {
                    verdict = 'In queue';
                } else {
                    // Check for final verdicts
                    const lowerHtml = html.toLowerCase();
                    if (lowerHtml.includes('accepted') && !lowerHtml.includes('not accepted')) {
                        verdict = 'Accepted';
                        waiting = false;
                    } else if (lowerHtml.includes('wrong answer')) {
                        verdict = 'Wrong Answer';
                        waiting = false;
                    } else if (lowerHtml.includes('time limit exceeded')) {
                        verdict = 'Time Limit Exceeded';
                        waiting = false;
                    } else if (lowerHtml.includes('memory limit exceeded')) {
                        verdict = 'Memory Limit Exceeded';
                        waiting = false;
                    } else if (lowerHtml.includes('runtime error')) {
                        verdict = 'Runtime Error';
                        waiting = false;
                    } else if (lowerHtml.includes('compilation error')) {
                        verdict = 'Compilation Error';
                        waiting = false;
                    }
                }

                // Try to extract time and memory
                let time = 0;
                let memory = 0;
                const timeMatch = html.match(/(\d+)\s*ms/i);
                if (timeMatch) time = parseInt(timeMatch[1]);
                const memMatch = html.match(/(\d+)\s*KB/i);
                if (memMatch) memory = parseInt(memMatch[1]);

                // Try to extract test count
                const testMatch = html.match(/on (?:pretest|test) (\d+)/i);
                if (testMatch) testNumber = parseInt(testMatch[1]);

                return NextResponse.json({
                    found: true,
                    success: true,
                    verdict,
                    waiting,
                    testNumber,
                    time,
                    memory,
                    submissionId: Number(submissionId)
                });
            }
        }

        return NextResponse.json({
            found: false,
            success: false,
            message: 'Submission not found'
        });

    } catch (error) {
        console.error('CF API Proxy Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
