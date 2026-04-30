import { useState, useEffect, useRef } from 'react';
import { CFSubmissionStatus } from '@/components/mirror/shared/types';
import { mapLanguageToExtension, getSubmitUrl, mapVerdict } from '@/lib/codeforcesUtils';

const FINAL_VERDICTS = new Set([
    'OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED',
    'RUNTIME_ERROR', 'COMPILATION_ERROR', 'CHALLENGED', 'SKIPPED', 'PARTIAL',
    'IDLENESS_LIMIT_EXCEEDED', 'SECURITY_VIOLATED', 'CRASHED',
    'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded',
    'Runtime Error', 'Compilation Error', 'Challenged', 'Skipped', 'Partial',
    'Idleness Limit Exceeded', 'Compilation error', 'Wrong answer',
    'Time limit exceeded', 'Memory limit exceeded'
]);

interface UseCodeforcesSubmissionParams {
    code: string;
    language: string;
    contestId: string;
    problemId: string;
    urlType: string;
    groupId?: string;
    setIsTestPanelVisible: (visible: boolean) => void;
    setTestPanelActiveTab: (tab: 'testcase' | 'result' | 'codeforces') => void;
    onSubmissionSaved?: () => void;
    problemRating?: number;
    problemTags?: string[];
    problemName?: string;
}

interface UseCodeforcesSubmissionReturn {
    cfStatus: CFSubmissionStatus | null;
    handleSubmit: () => Promise<void>;
    submitting: boolean;
}

export function useCodeforcesSubmission({
    code,
    language,
    contestId,
    problemId,
    urlType,
    groupId,
    setIsTestPanelVisible,
    setTestPanelActiveTab,
    onSubmissionSaved,
    problemRating,
    problemTags,
    problemName
}: UseCodeforcesSubmissionParams): UseCodeforcesSubmissionReturn {
    const [cfStatus, setCfStatus] = useState<CFSubmissionStatus | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const activeSubIdRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Reset status when problem changes
    useEffect(() => {
        setCfStatus(null);
        activeSubIdRef.current = null;
    }, [contestId, problemId]);

    const handleSubmit = async () => {
        if (!code || submitting) return;

        setSubmitting(true);
        setIsTestPanelVisible(true);
        setTestPanelActiveTab('codeforces');
        setCfStatus({ status: 'submitting' });
        activeSubIdRef.current = null;

        // Check extension is installed
        if (!document.getElementById('verdict-extension-installed')) {
            window.open('https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj', '_blank');
            setCfStatus({
                status: 'error',
                error: 'Extension not detected. Install the Verdict Helper extension to submit directly.'
            });
            setSubmitting(false);
            return;
        }

        // Check login status
        const loginStatus = await new Promise<{ loggedIn: boolean; handle?: string }>((resolve) => {
            const timeout = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ loggedIn: false });
            }, 3000);

            const handler = (event: MessageEvent) => {
                if (event.data?.type === 'VERDICT_LOGIN_STATUS') {
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    resolve({
                        loggedIn: event.data.loggedIn,
                        handle: event.data.handle
                    });
                }
            };

            window.addEventListener('message', handler);
            window.postMessage({ type: 'VERDICT_CHECK_LOGIN' }, '*');
        });

        if (!loginStatus.loggedIn) {
            setCfStatus({
                status: 'error',
                error: 'You must log in to Codeforces first. Open codeforces.com and sign in.',
                needsCaptcha: true,
                captchaUrl: getSubmitUrl(contestId, problemId, urlType, groupId)
            });
            setSubmitting(false);
            return;
        }

        // Request cookies + CSRF from extension
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extResponse = await new Promise<any>((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'VERDICT_SUBMISSION_RESULT') {
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'TIMEOUT_NO_RESPONSE' });
            }, 15000);

            window.addEventListener('message', handler);

            window.postMessage({
                type: 'VERDICT_SUBMIT',
                payload: {
                    contestId,
                    problemIndex: problemId,
                    code,
                    language: mapLanguageToExtension(language),
                    urlType,
                    groupId
                }
            }, '*');
        });

        if (!extResponse.success) {
            if (extResponse.error === 'TIMEOUT_NO_RESPONSE') {
                window.open('https://chromewebstore.google.com/detail/verdict-helper/jeiffogppnpnefphgpglagmgbcnifnhj', '_blank');
                setCfStatus({
                    status: 'error',
                    error: 'Extension did not respond. Please install or update the Verdict Helper extension.'
                });
            } else if (extResponse.error === 'NOT_LOGGED_IN') {
                setCfStatus({
                    status: 'error',
                    error: 'Please log in to Codeforces first',
                    needsCaptcha: true,
                    captchaUrl: 'https://codeforces.com/enter'
                });
            } else {
                setCfStatus({
                    status: 'error',
                    error: extResponse.error || 'Failed to get cookies from extension'
                });
            }
            setSubmitting(false);
            return;
        }

        // Server-side submission via our API → Scrapling bridge
        const userHandle = extResponse.handle || loginStatus.handle || null;

        try {
            // Phased progress
            const phases = [
                { delay: 0,     msg: 'Connecting to Codeforces...', pct: 5 },
                { delay: 3000,  msg: 'Opening submission page...', pct: 15 },
                { delay: 8000,  msg: 'Solving Cloudflare challenge...', pct: 30 },
                { delay: 15000, msg: 'Still solving challenge...', pct: 45 },
                { delay: 25000, msg: 'Filling submission form...', pct: 60 },
                { delay: 35000, msg: 'Submitting code...', pct: 75 },
                { delay: 50000, msg: 'Waiting for Codeforces response...', pct: 90 },
            ];
            const phaseTimers: ReturnType<typeof setTimeout>[] = [];
            let submissionDone = false;

            for (const phase of phases) {
                const t = setTimeout(() => {
                    if (!submissionDone) {
                        setCfStatus({ status: 'submitting', substatus: phase.msg, progress: phase.pct });
                    }
                }, phase.delay);
                phaseTimers.push(t);
            }

            setCfStatus({ status: 'submitting', substatus: phases[0].msg, progress: phases[0].pct });

            // Step 1: Start the submission job (returns immediately with jobId)
            const startRes = await fetch('/api/codeforces/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestId,
                    problemIndex: problemId,
                    code,
                    language: mapLanguageToExtension(language),
                    cookies: extResponse.cookies,
                    csrfToken: extResponse.csrfToken,
                    urlType,
                    groupId: groupId || null,
                }),
            });

            let startData;
            const ct = startRes.headers.get('content-type');
            if (ct && ct.includes('application/json')) {
                startData = await startRes.json();
            } else {
                startData = { error: `Server error (${startRes.status})` };
            }

            if (!startData.jobId) {
                submissionDone = true;
                phaseTimers.forEach(t => clearTimeout(t));
                const apiData = startData;
                if (apiData.success !== undefined) {
                    if (!apiData.success) {
                        setCfStatus({ status: 'error', error: apiData.error || 'Submission failed' });
                        setSubmitting(false);
                        return;
                    }
                } else {
                    setCfStatus({ status: 'error', error: startData.error || 'Failed to start submission' });
                    setSubmitting(false);
                    return;
                }
            }

            // Step 2: Poll for result
            const jobId = startData.jobId;
            let apiData: { success?: boolean; error?: string; submissionId?: string; [key: string]: unknown } | null = null;

            if (jobId) {
                const maxPolls = 60; // 60 * 2s = 120s
                for (let i = 0; i < maxPolls; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    if (!isMountedRef.current) return;

                    try {
                        const pollRes = await fetch(`/api/codeforces/submit-result?jobId=${jobId}`);
                        if (!pollRes.ok) continue;
                        const job = await pollRes.json();
                        if (job.status === 'done' && job.result) {
                            apiData = job.result;
                            break;
                        }
                    } catch {
                        // Network error — keep polling
                    }
                }

                submissionDone = true;
                phaseTimers.forEach(t => clearTimeout(t));

                if (!apiData) {
                    setCfStatus({
                        status: 'error',
                        error: 'Submission timed out. Check Codeforces directly for the result.'
                    });
                    setSubmitting(false);
                    return;
                }
            }

            // Handle API errors
            if (!apiData || !apiData.success) {
                const errorData = apiData || { error: 'No response from bridge' };
                let errorMessage = (errorData.error as string) || 'Submission failed';
                let needsCaptcha = false;

                if (errorData.error === 'DUPLICATE_SUBMISSION') {
                    setCfStatus({
                        status: 'error',
                        error: 'You have submitted exactly the same code before!',
                        isDuplicate: true,
                        submissionId: errorData.submissionId ? Number(errorData.submissionId) : undefined
                    });
                    setSubmitting(false);
                    return;
                }

                if (errorData.error === 'NOT_LOGGED_IN') {
                    errorMessage = 'Session expired. Please log in to Codeforces again.';
                    needsCaptcha = true;
                } else if (errorData.error === 'RATE_LIMITED') {
                    errorMessage = 'Too many submissions. Please wait a moment.';
                } else if (errorData.error === 'VIRTUAL_REGISTRATION_REQUIRED') {
                    errorMessage = 'This is a past contest. Register for virtual participation on Codeforces first.';
                    window.open(`https://codeforces.com/contestRegistration/${contestId}/virtual/true`, '_blank');
                } else if (errorData.error === 'GYM_ENTRY_REQUIRED') {
                    errorMessage = 'You need to enter this Gym first.';
                    window.open(`https://codeforces.com/gym/${contestId}`, '_blank');
                }

                setCfStatus({
                    status: 'error',
                    error: errorMessage,
                    needsCaptcha,
                    captchaUrl: needsCaptcha ? 'https://codeforces.com/enter' : undefined
                });
                setSubmitting(false);
                return;
            }

            // Submission success → start polling for verdict
            const submissionId = apiData.submissionId ? Number(apiData.submissionId) : undefined;

            setCfStatus({ status: 'waiting', submissionId });

            if (submissionId) {
                activeSubIdRef.current = submissionId;
                const startTime = Date.now();
                const MAX_POLL_MS = 5 * 60 * 1000; // 5 minutes

                const pollCfApi = async () => {
                    try {
                        const handleParam = userHandle ? `&handle=${encodeURIComponent(userHandle)}` : '';
                        const cookieParam = `&cookies=${encodeURIComponent(extResponse.cookies)}`;
                        const typeParam = `&urlType=${urlType}${groupId ? `&groupId=${groupId}` : ''}`;
                        const res = await fetch(`/api/codeforces/submission?contestId=${contestId}&submissionId=${submissionId}${handleParam}${cookieParam}${typeParam}`);
                        if (res.ok) return await res.json();
                        return null;
                    } catch {
                        return null;
                    }
                };

                while (true) {
                    const elapsed = Date.now() - startTime;
                    if (elapsed > MAX_POLL_MS) break;
                    if (!isMountedRef.current || activeSubIdRef.current !== submissionId) return;

                    // Adaptive interval: 2s for first 30s, 3s after
                    const interval = elapsed < 30000 ? 2000 : 3000;
                    await new Promise(r => setTimeout(r, interval));

                    const status = await pollCfApi();

                    if (status && status.success !== false) {
                        const rawVerdict = status.verdict;
                        const verdictText = mapVerdict(rawVerdict);

                        const isFinal =
                            rawVerdict !== null &&
                            (FINAL_VERDICTS.has(rawVerdict) || FINAL_VERDICTS.has(verdictText));

                        if (isFinal) {
                            const isCompilationError = verdictText === 'Compilation Error' || rawVerdict === 'COMPILATION_ERROR';
                            const failedTest = !isCompilationError && verdictText !== 'Accepted' && status.testNumber !== undefined
                                ? status.testNumber + 1
                                : undefined;

                            // Save submission to DB with retry (3 attempts)
                            const saveBody = JSON.stringify({
                                contestId,
                                problemIndex: problemId,
                                sourceCode: code,
                                language,
                                cfSubmissionId: submissionId,
                                verdict: verdictText,
                                timeMs: status.time,
                                memoryKb: status.memory,
                                passedTestCount: status.testNumber,
                                problemRating: problemRating || null,
                                problemTags: problemTags || null,
                                problemName: problemName || null,
                            });

                            let saved = false;
                            for (let attempt = 0; attempt < 3; attempt++) {
                                try {
                                    const saveRes = await fetch('/api/submissions', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: saveBody,
                                    });
                                    if (saveRes.ok) { saved = true; break; }
                                } catch (e) {
                                    console.warn(`Save attempt ${attempt + 1}/3 failed:`, e);
                                }
                                if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                            }
                            if (saved) onSubmissionSaved?.();
                            else console.error('All 3 save attempts failed for submission', submissionId);

                            setCfStatus({
                                status: 'done',
                                verdict: verdictText,
                                time: status.time,
                                memory: status.memory,
                                testNumber: status.testNumber,
                                submissionId,
                                compilationError: status.compilationError,
                                details: status.details,
                                failedTestCase: failedTest
                            });

                            break;
                        }

                        const elapsedSec = Math.round(elapsed / 1000);
                        if (rawVerdict === 'TESTING' || verdictText === 'Testing') {
                            setCfStatus({
                                status: 'testing',
                                testNumber: status.testNumber,
                                submissionId
                            });
                        } else if (!rawVerdict || verdictText === 'In queue') {
                            setCfStatus({
                                status: 'waiting',
                                submissionId,
                                substatus: elapsedSec > 15 ? `In queue for ${elapsedSec}s...` : undefined
                            });
                        }
                    }
                }

                if (Date.now() - startTime >= MAX_POLL_MS) {
                    console.warn('Polling timeout after 5 minutes');
                    setCfStatus(prev => prev ? {
                        ...prev,
                        status: 'error',
                        error: 'Polling timed out after 5 minutes. Check Codeforces directly for the result.'
                    } : { status: 'error', error: 'Polling timed out' });
                }
            }

        } catch (err) {
            submissionDone = true;
            phaseTimers.forEach(t => clearTimeout(t));
            console.error('Server submission error:', err);
            setCfStatus({
                status: 'error',
                error: 'Failed to submit via server. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return { cfStatus, handleSubmit, submitting };
}
