import { useState, useEffect } from 'react';
import { CFSubmissionStatus } from '@/app/components/mirror/types';
import { mapLanguageToExtension, getSubmitUrl, mapVerdict } from '@/app/utils/codeforcesUtils';

interface UseCodeforcesSubmissionParams {
    code: string;
    language: string;
    contestId: string;
    problemId: string;
    urlType: string;
    groupId?: string;
    setIsTestPanelVisible: (visible: boolean) => void;
    setTestPanelActiveTab: (tab: 'testcase' | 'result' | 'codeforces') => void;
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
    setTestPanelActiveTab
}: UseCodeforcesSubmissionParams): UseCodeforcesSubmissionReturn {
    const [cfStatus, setCfStatus] = useState<CFSubmissionStatus | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset status when problem changes
    useEffect(() => {
        setCfStatus(null);
    }, [contestId, problemId]);

    const handleSubmit = async () => {
        if (!code) return;

        setSubmitting(true);
        setIsTestPanelVisible(true);
        
        // Switch to Codeforces tab and update status
        setTestPanelActiveTab('codeforces');
        setCfStatus({ status: 'submitting' });

        // 1. Fast Fail: Check if extension is injected
        if (!document.getElementById('verdict-extension-installed')) {
            window.open(getSubmitUrl(contestId, problemId, urlType, groupId), '_blank');
            setCfStatus({ 
                status: 'error', 
                error: 'Extension not detected. Opened Codeforces submit page in a new tab.' 
            });
            setSubmitting(false);
            return;
        }

        // Promise to handle the submission response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitPromise = new Promise<any>((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'VERDICT_SUBMISSION_RESULT') {
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            // Set a timeout for the submission response
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'TIMEOUT_NO_RESPONSE' });
            }, 60000); // Increased timeout for captcha wait

            window.addEventListener('message', handler);

            // Send submission request
            window.postMessage({
                type: 'VERDICT_SUBMIT',
                payload: {
                    contestId,
                    problemIndex: problemId,
                    code,
                    language: mapLanguageToExtension(language),
                    urlType, // contest, gym, problemset, group
                    groupId
                }
            }, '*');
        });

        // Helper to check status with timeout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkStatus = (subId: string) => new Promise<any>((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'VERDICT_SUBMISSION_STATUS_RESULT') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            const timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'STATUS_CHECK_TIMEOUT' });
            }, 10000); // 10 second timeout for status check

            window.addEventListener('message', handler);
            window.postMessage({
                type: 'VERDICT_CHECK_SUBMISSION',
                payload: { contestId, submissionId: subId, urlType, groupId }
            }, '*');
        });

        try {
            const response = await submitPromise;

            // 2. Timeout Fallback
            if (response.error === 'TIMEOUT_NO_RESPONSE') {
                window.open(getSubmitUrl(contestId, problemId, urlType, groupId), '_blank');
                setCfStatus({ 
                    status: 'error', 
                    error: 'Extension did not respond. Opened Codeforces submit page for manual submission.' 
                });
                return;
            }

            // 3. Handle Duplicate Submission
            if (response.error === 'DUPLICATE_SUBMISSION') {
                setCfStatus({ 
                    status: 'error', 
                    error: 'You have submitted exactly the same code before!',
                    isDuplicate: true,
                    submissionId: response.submissionId ? Number(response.submissionId) : undefined
                });
                return;
            }

            // Handle Captcha/Cloudflare Challenge
            if (response.error === 'CLOUDFLARE_CHALLENGE' || response.error === 'CAPTCHA_REQUIRED') {
                setCfStatus({ 
                    status: 'error', 
                    error: 'Captcha verification required. Please complete it manually.',
                    needsCaptcha: true,
                    captchaUrl: getSubmitUrl(contestId, problemId, urlType, groupId)
                });
                return;
            }

            if (response.success) {
                const submissionId = response.submissionId ? Number(response.submissionId) : undefined;
                const userHandle = response.handle;
                
                // Update CF status to waiting
                setCfStatus({ 
                    status: 'waiting', 
                    submissionId 
                });

                // Start Polling if we have an ID
                if (submissionId) {
                    let attempts = 0;
                    const maxAttempts = 120; // ~3 minutes max
                    
                    // Direct API polling function - faster than going through extension
                    const pollCfApi = async () => {
                        try {
                            // Try direct CF API if we have handle
                            if (userHandle) {
                                const apiRes = await fetch(`https://codeforces.com/api/user.status?handle=${userHandle}&count=10`);
                                const apiData = await apiRes.json();
                                
                                if (apiData.status === 'OK' && apiData.result) {
                                    const sub = apiData.result.find((s: { id: number }) => s.id === submissionId);
                                    if (sub) {
                                        return {
                                            success: true,
                                            verdict: sub.verdict || null,
                                            testNumber: sub.passedTestCount,
                                            time: sub.timeConsumedMillis,
                                            memory: Math.round(sub.memoryConsumedBytes / 1024),
                                            waiting: !sub.verdict || sub.verdict === 'TESTING'
                                        };
                                    }
                                }
                            }
                            
                            // Fallback to our API route
                            const res = await fetch(`/api/codeforces/submission?contestId=${contestId}&submissionId=${submissionId}`);
                            if (res.ok) {
                                return await res.json();
                            }
                            return null;
                        } catch {
                            return null;
                        }
                    };

                    while (attempts < maxAttempts) {
                        // Fast polling - 1 second intervals
                        await new Promise(r => setTimeout(r, 1000));

                        // Try direct API first (faster)
                        let status = await pollCfApi();
                        
                        // Fallback to extension if API failed
                        if (!status) {
                            status = await checkStatus(String(submissionId));
                        }

                        if (status && status.success !== false) {
                            const rawVerdict = status.verdict;
                            const verdictText = mapVerdict(rawVerdict);

                            const isFinal = !status.waiting &&
                                rawVerdict !== null &&
                                rawVerdict !== 'TESTING';

                            if (rawVerdict === 'TESTING' || verdictText === 'Testing') {
                                setCfStatus({
                                    status: 'testing',
                                    testNumber: status.testNumber,
                                    submissionId
                                });
                            } else if (!rawVerdict || verdictText === 'In queue') {
                                setCfStatus({
                                    status: 'waiting',
                                    submissionId
                                });
                            }

                            if (isFinal) {
                                // Calculate failed test case (1-indexed for display)
                                const failedTest = verdictText !== 'Accepted' && status.testNumber !== undefined 
                                    ? status.testNumber + 1 
                                    : undefined;

                                // Final verdict received
                                setCfStatus({
                                    status: 'done',
                                    verdict: verdictText,
                                    time: status.time,
                                    memory: status.memory,
                                    testNumber: status.testNumber,
                                    submissionId,
                                    compilationError: status.compilationError,
                                    failedTestCase: failedTest
                                });
                                break;
                            }
                        }
                        attempts++;
                    }

                    if (attempts >= maxAttempts) {
                        console.warn('Polling timeout - verdict may still be pending');
                        setCfStatus(prev => prev ? {
                            ...prev,
                            status: 'error',
                            error: 'Polling timed out. Check Codeforces directly for the result.'
                        } : { status: 'error', error: 'Polling timed out' });
                    }
                }
            } else {
                // Handle specific error types
                let errorMessage = response.error || 'Submission failed';
                let needsCaptcha = false;

                if (response.error === 'NOT_LOGGED_IN') {
                    errorMessage = 'Please log in to Codeforces first';
                    needsCaptcha = true; // User needs to visit CF
                } else if (response.error === 'RATE_LIMITED') {
                    errorMessage = 'Too many submissions. Please wait a moment.';
                } else if (response.error === 'VIRTUAL_REGISTRATION_REQUIRED') {
                    errorMessage = 'This is a past contest. Register for virtual participation on Codeforces first.';
                    window.open(`https://codeforces.com/contestRegistration/${contestId}/virtual/true`, '_blank');
                } else if (response.error === 'GYM_ENTRY_REQUIRED') {
                    errorMessage = 'You need to enter this Gym first.';
                    window.open(`https://codeforces.com/gym/${contestId}`, '_blank');
                }

                setCfStatus({
                    status: 'error',
                    error: errorMessage,
                    needsCaptcha,
                    captchaUrl: needsCaptcha ? getSubmitUrl(contestId, problemId, urlType, groupId) : undefined
                });
            }
        } catch (err) {
            console.error('Submission error:', err);
            setCfStatus({
                status: 'error',
                error: 'Failed to communicate with extension. Please refresh the page.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        cfStatus,
        handleSubmit,
        submitting
    };
}

