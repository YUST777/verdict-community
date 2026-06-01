/**
 * Verdict Helper Extension v1.1.0 — Content Script
 *
 * Bridges window.postMessage (from the Verdict page) ↔ chrome.runtime.sendMessage (to background).
 * Also injects a marker element so the page knows the extension is installed.
 */

// ─── Inject marker ──────────────────────────────────────────────────
(() => {
    const marker = document.createElement('div');
    marker.id = 'verdict-extension-installed';
    marker.setAttribute('data-version', '1.1.0');
    marker.style.display = 'none';
    document.documentElement.appendChild(marker);
})();

// ─── Helpers ─────────────────────────────────────────────────────────
function getSubmitUrl(contestId, problemIndex, urlType, groupId) {
    if (urlType === 'gym') {
        return `https://codeforces.com/gym/${contestId}/submit?problemIndex=${problemIndex}`;
    }
    if (urlType === 'group' && groupId) {
        return `https://codeforces.com/group/${groupId}/contest/${contestId}/submit?problemIndex=${problemIndex}`;
    }
    return `https://codeforces.com/contest/${contestId}/submit?problemIndex=${problemIndex}`;
}

// ─── Message Listener ────────────────────────────────────────────────
window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    const { type, payload } = event.data || {};

    // ── Check Login ──
    if (type === 'VERDICT_CHECK_LOGIN') {
        try {
            const result = await chrome.runtime.sendMessage({ type: 'CHECK_CF_LOGIN' });
            window.postMessage({
                type: 'VERDICT_LOGIN_STATUS',
                loggedIn: result.loggedIn,
                handle: result.handle || null
            }, '*');
        } catch {
            window.postMessage({ type: 'VERDICT_LOGIN_STATUS', loggedIn: false }, '*');
        }
    }

    // ── Get Handle ──
    if (type === 'VERDICT_GET_HANDLE') {
        try {
            const result = await chrome.runtime.sendMessage({ type: 'GET_CF_HANDLE' });
            window.postMessage({
                type: 'VERDICT_HANDLE_RESPONSE',
                handle: result.handle || null
            }, '*');
        } catch {
            window.postMessage({ type: 'VERDICT_HANDLE_RESPONSE', handle: null }, '*');
        }
    }

    // ── Submit ──
    if (type === 'VERDICT_SUBMIT') {
        try {
            const { contestId, problemIndex, code, language, urlType, groupId } = payload;
            const submitUrl = getSubmitUrl(contestId, problemIndex, urlType, groupId);

            // 1. Get cookies
            const cookieResult = await chrome.runtime.sendMessage({ type: 'GET_CF_COOKIES' });
            if (!cookieResult.success) {
                window.postMessage({
                    type: 'VERDICT_SUBMISSION_RESULT',
                    success: false,
                    error: 'COOKIE_EXTRACTION_FAILED'
                }, '*');
                return;
            }

            // 2. Get CSRF token (placeholder — bridge handles CSRF server-side)
            const csrfResult = await chrome.runtime.sendMessage({
                type: 'GET_CSRF_TOKEN',
                submitUrl
            });
            if (!csrfResult.success) {
                window.postMessage({
                    type: 'VERDICT_SUBMISSION_RESULT',
                    success: false,
                    error: csrfResult.error || 'CSRF_FETCH_FAILED'
                }, '*');
                return;
            }

            // 3. Get handle for the response
            const handleResult = await chrome.runtime.sendMessage({ type: 'GET_CF_HANDLE' });

            // 4. Send cookies + csrf + submission data back to the page
            window.postMessage({
                type: 'VERDICT_SUBMISSION_RESULT',
                success: true,
                cookies: cookieResult.cookies,
                csrfToken: csrfResult.csrfToken,
                handle: handleResult.handle || null,
                serverSubmit: true,
                payload: { contestId, problemIndex, code, language, urlType, groupId }
            }, '*');

        } catch (err) {
            window.postMessage({
                type: 'VERDICT_SUBMISSION_RESULT',
                success: false,
                error: err.message || 'Extension error'
            }, '*');
        }
    }

    // ── Verify Codeforces Submission ──
    if (type === 'VERDICT_VERIFY_CF') {
        try {
            const { contestId, problemIndex, cfHandle } = payload;
            const result = await chrome.runtime.sendMessage({
                type: 'VERDICT_VERIFY_CF_BACKGROUND',
                payload: { contestId, problemIndex, cfHandle }
            });
            window.postMessage({
                type: 'VERDICT_VERIFY_CF_RESPONSE',
                success: result.success,
                submissionId: result.submissionId || null,
                timeMs: result.timeMs || 0,
                memoryKb: result.memoryKb || 0,
                error: result.error || null
            }, '*');
        } catch (err) {
            window.postMessage({
                type: 'VERDICT_VERIFY_CF_RESPONSE',
                success: false,
                error: err.message || 'Extension verification error'
            }, '*');
        }
    }
});
