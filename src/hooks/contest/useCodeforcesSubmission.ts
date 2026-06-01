import { useState, useEffect, useRef, useCallback } from 'react';
import { CFSubmissionStatus } from '@/components/mirror/shared/types';
import { mapLanguageToExtension, getSubmitUrl } from '@/lib/codeforcesUtils';

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
    sheetId?: string;
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
    sheetId
}: UseCodeforcesSubmissionParams): UseCodeforcesSubmissionReturn {
    const [cfStatus, setCfStatus] = useState<CFSubmissionStatus | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const activeSubIdRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);
    const submittingRef = useRef(false);

    const codeRef = useRef(code);
    const languageRef = useRef(language);
    codeRef.current = code;
    languageRef.current = language;

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // Reset status when problem changes
    useEffect(() => {
        setCfStatus(null);
        activeSubIdRef.current = null;
    }, [contestId, problemId]);

    const handleSubmit = useCallback(async () => {
        const currentCode = codeRef.current;
        const currentLanguage = languageRef.current;
        if (!currentCode || submittingRef.current) return;

        submittingRef.current = true;
        setSubmitting(true);
        setIsTestPanelVisible(true);
        setTestPanelActiveTab('codeforces');
        setCfStatus({ status: 'submitting', substatus: 'Opening Codeforces...', progress: 30 });
        activeSubIdRef.current = null;

        try {
            // 1. Open direct Codeforces submit page
            const cfUrl = getSubmitUrl(contestId, problemId, urlType, groupId);
            window.open(cfUrl, '_blank');

            setCfStatus({ status: 'submitting', substatus: 'Saving progress locally...', progress: 70 });

            // 2. Save submission progress locally so sheets/roadmap update!
            const cfSubmissionId = -Date.now();

            const saveRes = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contestId,
                    problemIndex: problemId,
                    sourceCode: currentCode,
                    language: mapLanguageToExtension(currentLanguage),
                    cfSubmissionId,
                    verdict: 'Accepted',
                    timeMs: 0,
                    memoryKb: 0,
                    sheetId: sheetId || null,
                    urlType,
                    groupId: groupId || null
                })
            });

            if (saveRes.ok) {
                setCfStatus({
                    status: 'done',
                    verdict: 'Accepted',
                    time: 0,
                    memory: 0,
                    submissionId: cfSubmissionId
                });
                onSubmissionSaved?.();
            } else {
                const errorData = await saveRes.json().catch(() => ({ error: 'Database save failed' }));
                setCfStatus({
                    status: 'error',
                    error: errorData.error || 'Failed to save submission progress locally.'
                });
            }
        } catch (err) {
            console.error('Manual submit failed:', err);
            setCfStatus({ status: 'error', error: 'Failed to complete submission.' });
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contestId, problemId, urlType, groupId, setIsTestPanelVisible, setTestPanelActiveTab, sheetId]);

    return {
        cfStatus,
        handleSubmit,
        submitting
    };
}
