// background.js - Service Worker for Verdict Helper Extension
// Handles the actual submission to Codeforces

// Language ID mapping for Codeforces (Fallbacks)
// The script will also try to match partial string names if key not found
const LANGUAGE_MAP = {
    'cpp17': 54,      // GNU G++17 7.3.0
    'cpp20': 89,      // GNU G++20 13.2 (64 bit)
    'cpp': 54,        // Default C++ = G++17
    'python3': 31,    // Python 3.12.5
    'pypy3': 70,      // PyPy 3.10 (7.3.17, 64bit)
    'java': 87,       // Java 21 64bit
    'kotlin': 88,     // Kotlin 1.9.21
    'rust': 75,       // Rust 1.75.0
    'go': 32,         // Go 1.21.6
    'node': 55,       // Node.js
    'csharp': 65      // C# 8.0 .NET Core
};

// Pending submission tracker (for legacy callback flow)
let pendingSubmission = null;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'pong', version: '1.0.3' });
        return true;
    }

    if (request.action === 'submitToCF') {
        handleSubmission(request.data)
            .then(sendResponse)
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true; // Keep channel open for async response
    }

    if (request.action === 'checkSubmissionStatus') {
        checkSubmissionStatus(request.data)
            .then(sendResponse)
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (request.action === 'cfSubmissionComplete') {
        // Received from injected script on Codeforces page
        if (pendingSubmission) {
            pendingSubmission.resolve(request.result);
            pendingSubmission = null;
        }
        return true;
    }

    if (request.action === 'checkLoginStatus') {
        checkLoginStatus()
            .then(sendResponse)
            .catch(err => sendResponse({ loggedIn: false, error: err.message }));
        return true;
    }
});

/**
 * Get the latest submission for a user from Codeforces API
 * This is useful when we just submitted and need to get the submission ID
 */
async function getLatestSubmission(contestId, problemIndex) {
    try {
        // Get handle from cookies
        const cookies = await chrome.cookies.getAll({ domain: 'codeforces.com' });
        const handleCookie = cookies.find(c => c.name === 'handle');

        if (!handleCookie) {
            console.warn('No handle cookie found');
            return null;
        }

        const userHandle = handleCookie.value;
        console.log('📡 Fetching latest submission for', userHandle, 'contest:', contestId, 'problem:', problemIndex);

        // Fetch latest submissions  
        const apiUrl = `https://codeforces.com/api/user.status?handle=${userHandle}&count=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.result && data.result.length > 0) {
            // Find the most recent submission for this contest/problem
            const submission = data.result.find(sub => {
                const matchesContest = sub.contestId === parseInt(contestId);
                const matchesProblem = sub.problem?.index?.toUpperCase() === problemIndex?.toUpperCase();
                return matchesContest && matchesProblem;
            });

            if (submission) {
                console.log('✅ Found latest submission:', submission.id);
                return submission;
            }

            // If not found by problem, just return the latest one for this contest
            const anySubmission = data.result.find(sub => sub.contestId === parseInt(contestId));
            if (anySubmission) {
                console.log('✅ Found latest submission (any problem):', anySubmission.id);
                return anySubmission;
            }

            // Last resort: return the very latest submission
            console.log('⚠️ Returning most recent submission:', data.result[0].id);
            return data.result[0];
        }

        return null;
    } catch (error) {
        console.error('Error fetching latest submission:', error);
        return null;
    }
}

/**
 * Check the status of a specific submission using Codeforces API
 * This is more reliable than scraping HTML.
 */
async function checkSubmissionStatus({ contestId, submissionId, urlType, handle }) {
    try {
        // First, try to get handle from cookies if not provided
        let userHandle = handle;
        if (!userHandle) {
            const cookies = await chrome.cookies.getAll({ domain: 'codeforces.com' });
            const handleCookie = cookies.find(c => c.name === 'handle');
            if (handleCookie) {
                userHandle = handleCookie.value;
            }
        }

        // If we have a handle, use the API (much more reliable)
        if (userHandle) {
            console.log('📡 Using Codeforces API to check submission status for handle:', userHandle, 'submission:', submissionId);

            const apiUrl = `https://codeforces.com/api/user.status?handle=${userHandle}&count=10`;
            const response = await fetch(apiUrl, { credentials: 'include' });
            const data = await response.json();

            if (data.status === 'OK' && data.result) {
                // Find the specific submission by ID
                const submission = data.result.find(sub => sub.id === parseInt(submissionId));

                if (submission) {
                    // ... existing logic ...
                    console.log('✅ Found submission in API:', {
                        id: submission.id,
                        verdict: submission.verdict,
                        testCount: submission.passedTestCount,
                        time: submission.timeConsumedMillis,
                        memory: submission.memoryConsumedBytes
                    });

                    // Map Codeforces API verdict to our format
                    const verdictMap = {
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
                        'SECURITY_VIOLATED': 'Security Violated',
                        'CRASHED': 'Crashed',
                        'INPUT_PREPARATION_CRASHED': 'Input Preparation Crashed',
                        'REJECTED': 'Rejected',
                        'IDLENESS_LIMIT_EXCEEDED': 'Idleness Limit Exceeded'
                    };

                    // Determine verdict - if no verdict field, it's still in queue
                    const verdict = submission.verdict
                        ? (verdictMap[submission.verdict] || submission.verdict)
                        : 'In queue';

                    // isWaiting is TRUE only if:
                    // 1. No verdict yet (still in queue), OR
                    // 2. Currently testing
                    const isWaiting = !submission.verdict || submission.verdict === 'TESTING';

                    // passedTestCount interpretation:
                    // - For "Testing": it's the current test being run (0-indexed, so we +1)
                    // - For failures: it's tests passed BEFORE failure
                    // - For Accepted: it's total tests passed
                    const testNumber = submission.passedTestCount !== undefined
                        ? submission.passedTestCount
                        : 0;

                    const result = {
                        success: true,
                        verdict: verdict,
                        waiting: isWaiting,
                        testNumber: testNumber,
                        memory: submission.memoryConsumedBytes ? Math.round(submission.memoryConsumedBytes / 1024) : 0, // KB
                        time: submission.timeConsumedMillis || 0, // ms
                        submissionId: submission.id,
                        contestId: submission.contestId,
                        problem: submission.problem?.name || '',
                        compilationError: verdict === 'Compilation Error' ? await getCompilationError(submission.contestId, submission.id) : null
                    };

                    console.log('📤 Returning status:', result);
                    return result;
                } else {
                    console.warn('⚠️ Submission', submissionId, 'not found in API response (may still be processing)');
                }
            }

            // If API didn't find it, it might still be processing or submission ID is wrong
            console.warn('Submission not found in API response, falling back to scraping');
        }

        // Fallback: Scrape HTML (for gym contests or when API fails)
        console.log('📄 Falling back to HTML scraping for submission status, URL:', url);
        let url;
        if (urlType === 'gym') {
            url = `https://codeforces.com/gym/${contestId}/submission/${submissionId}`;
        } else {
            url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
        }

        const response = await fetch(url, { credentials: 'include' });
        const text = await response.text();

        // Debug: Check what the page contains
        console.log('📄 HTML scraping - page length:', text.length);

        // Check for active testing states FIRST (before parsing verdict spans)
        const normalizedText = text.toLowerCase();

        // Safety Fallback: Check for blocking pages (Cloudflare, Login, etc.)
        if (normalizedText.includes('checking your browser') || normalizedText.includes('challenge') || normalizedText.includes('login') || normalizedText.includes('enter')) {
            console.log('⚠️ Fetch blocked by Cloudflare or Login. Switching to Tab Scraper.');
            return await scrapeUsingTab(url);
        }

        const inQueue = text.includes('In queue') || text.includes('in queue');
        const running = text.includes('Running on test');

        let testNum = 0;
        if (running) {
            const match = text.match(/Running on test (\d+)/);
            if (match) testNum = parseInt(match[1]);
        }

        let verdict = 'Unknown';
        let isWaiting = false;

        // Handle active states first (before they get a verdict assigned)
        if (inQueue) {
            verdict = 'In queue';
            isWaiting = true;
        } else if (running) {
            verdict = 'Testing';
            isWaiting = true;
        } else {
            // Check for specific verdict text patterns FIRST (more reliable than regex)
            const normalizedText = text.toLowerCase();

            if (normalizedText.includes('compilation error')) {
                verdict = 'Compilation Error';
            } else if (normalizedText.includes('accepted') && !normalizedText.includes('not accepted')) {
                verdict = 'Accepted';
            } else if (normalizedText.includes('wrong answer')) {
                verdict = 'Wrong Answer';
            } else if (normalizedText.includes('time limit exceeded')) {
                verdict = 'Time Limit Exceeded';
            } else if (normalizedText.includes('memory limit exceeded')) {
                verdict = 'Memory Limit Exceeded';
            } else if (normalizedText.includes('runtime error')) {
                verdict = 'Runtime Error';
            } else if (normalizedText.includes('idleness limit exceeded')) {
                verdict = 'Idleness Limit Exceeded';
            } else if (normalizedText.includes('security violated')) {
                verdict = 'Security Violated';
            } else {
                // Fallback: Try to parse verdict spans
                const verdictMatch = text.match(/<span[^>]*class=["']verdict-[^"']*["'][^>]*>([^<]+)<\/span>/i) ||
                    text.match(/<span[^>]*class=["']submissionVerdictWrapper[^"']*["'][^>]*>([^<]+)<\/span>/i);

                if (verdictMatch) {
                    let rawVerdict = verdictMatch[1].trim();

                    // Check if the "verdict" is just a number (this means it's a test number, not a verdict!)
                    if (/^\d+$/.test(rawVerdict)) {
                        console.log('Detected test number instead of verdict:', rawVerdict);
                        verdict = 'Testing';
                        isWaiting = true;
                        testNum = parseInt(rawVerdict);
                    } else {
                        verdict = rawVerdict;
                        // Normalize
                        if (verdict.toLowerCase().includes('accepted')) verdict = 'Accepted';
                        else if (verdict.toLowerCase().includes('wrong')) verdict = 'Wrong Answer';
                        else if (verdict.toLowerCase().includes('time')) verdict = 'Time Limit Exceeded';
                        else if (verdict.toLowerCase().includes('memory')) verdict = 'Memory Limit Exceeded';
                        else if (verdict.toLowerCase().includes('runtime')) verdict = 'Runtime Error';
                        else if (verdict.toLowerCase().includes('compilation')) verdict = 'Compilation Error';
                    }
                }
            }
        }

        // Try to extract time and memory from HTML
        let timeMs = 0;
        let memoryKb = 0;

        // Match patterns like "1718 ms" or "Time: 1718 ms"
        const timeMatch = text.match(/(\d+)\s*ms/i);
        if (timeMatch) {
            timeMs = parseInt(timeMatch[1]);
        }

        // Match patterns like "45600 KB" or "Memory: 45600 KB"
        const memoryMatch = text.match(/(\d+)\s*KB/i);
        if (memoryMatch) {
            memoryKb = parseInt(memoryMatch[1]);
        }

        console.log('📄 HTML scraping result:', { verdict, isWaiting, testNum, timeMs, memoryKb });

        // If after all this we still have "Unknown" or stuck "In queue" but page seems valid?
        // Let's rely on Tab Scraper if "Unknown" to be safe.
        if (verdict === 'Unknown') {
            console.log('⚠️ Verdict unknown after scrape. Trying Tab Scraper as reliability fallback.');
            return await scrapeUsingTab(url);
        }

        return {
            success: true,
            verdict: verdict,
            waiting: isWaiting || verdict === 'Unknown',
            testNumber: testNum,
            memory: memoryKb,
            time: timeMs
        };

    } catch (error) {
        console.error('Error checking submission status:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user is logged into Codeforces
 */
async function checkLoginStatus() {
    try {
        const cookies = await chrome.cookies.getAll({ domain: 'codeforces.com' });
        const hasSession = cookies.some(c => c.name === 'JSESSIONID' || c.name === '39ce7');

        if (!hasSession) {
            return { loggedIn: false };
        }

        const handleCookie = cookies.find(c => c.name === 'handle');
        if (handleCookie) {
            return { loggedIn: true, handle: handleCookie.value };
        }

        // Fallback: Try to detect from existing tabs
        const tabs = await chrome.tabs.query({ url: '*://codeforces.com/*' });
        if (tabs.length > 0) {
            try {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        const handleMatch = document.body.innerHTML.match(/handle\s*=\s*["']([^"']+)["']/);
                        const logoutLink = document.querySelector('a[href*="logout"]');
                        return {
                            loggedIn: !!logoutLink,
                            handle: handleMatch ? handleMatch[1] : null
                        };
                    }
                });
                if (results && results[0]) {
                    return results[0].result;
                }
            } catch {
                // Ignore errors from protected/loading tabs
            }
        }

        return { loggedIn: true, handle: null };
    } catch (error) {
        return { loggedIn: false, error: error.message };
    }
}

/**
 * Main submission handler - Opens CF submit page, fills form, and submits
 */
async function handleSubmission({ contestId, problemIndex, code, language, urlType = 'contest', groupId = null }) {
    console.log('📤 Starting submission...', { contestId, problemIndex, language, urlType, groupId });

    const languageId = LANGUAGE_MAP[language] || LANGUAGE_MAP['cpp'];

    // Determine the correct submit URL based on URL type
    let submitUrl;
    switch (urlType) {
        case 'gym':
            submitUrl = `https://codeforces.com/gym/${contestId}/submit`;
            break;
        case 'group':
            if (!groupId) {
                return { success: false, error: 'Group ID is required for group problems' };
            }
            submitUrl = `https://codeforces.com/group/${groupId}/contest/${contestId}/submit`;
            break;
        case 'acmsguru':
            submitUrl = `https://codeforces.com/problemsets/acmsguru/submit`;
            break;
        case 'problemset':
        case 'contest':
        default:
            submitUrl = `https://codeforces.com/contest/${contestId}/submit`;
            break;
    }

    // RECURSIVE RETRY COUNTER
    // We attach it to the request data implicitly or pass it as arg. 
    // Since we can't easily change signature without breaking message passing, we handle it internally?
    // Actually, handleSubmission is called by message listener.
    // If we want recursive retry, we can just call handleSubmission again.
    // Be careful of infinite loops. We'll use a local variable passed in?
    // JavaScript args are flexible.
    const attempt = arguments[1] || 1;
    if (attempt > 3) return { success: false, error: 'MAX_RETRIES_EXCEEDED' };

    try {
        // Helper function to create tab with retry (handles "Tabs cannot be edited" error)
        const createTabWithRetry = async (url, maxRetries = 5) => {
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const tab = await chrome.tabs.create({ url, active: false });
                    return tab;
                } catch (err) {
                    const isTabBusy = err.message && (
                        err.message.includes('Tabs cannot be edited') ||
                        err.message.includes('user may be dragging') ||
                        err.message.includes('cannot be modified')
                    );

                    if (isTabBusy && i < maxRetries - 1) {
                        console.log(`⏳ Tab busy (${err.message}), retrying in ${(i + 1) * 500}ms...`);
                        await new Promise(r => setTimeout(r, (i + 1) * 500));
                        continue;
                    }
                    throw err;
                }
            }
            throw new Error('Failed to create tab after retries');
        };

        // Create a new tab with the submit page (with retry)
        const tab = await createTabWithRetry(submitUrl);

        // Inject script to fill and submit the form

        // Wait 5 seconds for Cloudflare/Page Load
        console.log('⏳ Waiting 5s for Cloudflare/Page Load...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('💉 Injecting submission script...');

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [problemIndex, languageId, code, urlType],
            func: async (problemIdx, langId, sourceCode, type) => {

                // Helper to wait for elements
                const waitFor = async (selectors, timeout = 10000) => {
                    const selectorList = selectors.split(',').map(s => s.trim());
                    const start = Date.now();

                    while (Date.now() - start < timeout) {
                        for (const selector of selectorList) {
                            const el = document.querySelector(selector);
                            if (el) return el;
                        }
                        await new Promise(r => requestAnimationFrame(r));
                    }
                    return null;
                };

                try {
                    console.log('Script started. URL:', window.location.href);

                    // 1. Wait for page readiness
                    console.log('Waiting for form...');
                    const readyEl = await waitFor('form.submit-form, form[action*="submit"], .enter-contest, input[name="handleOrEmail"]');
                    console.log('Ready element found:', readyEl);

                    // Check for "Enter Gym" / "Join" scenarios
                    const joinBtn = document.querySelector('.enter-contest') ||
                        document.querySelector('form[action*="enter"] input[type="submit"]') ||
                        document.querySelector('input[value="Enter"]');

                    if (joinBtn || document.body.innerText.includes('Enter the contest')) {
                        console.log('Gym Entry Required detected');
                        if (joinBtn) {
                            console.log('Attempting auto-join...');
                            joinBtn.click();
                            return { success: false, error: 'GYM_JOINING' };
                        }
                        return { success: false, error: 'GYM_ENTRY_REQUIRED' };
                    }

                    // Check for login
                    if (document.querySelector('input[name="handleOrEmail"]')) {
                        return { success: false, error: 'NOT_LOGGED_IN' };
                    }

                    // Check for virtual participation
                    const currentUrl = window.location.href;
                    if (currentUrl.includes('contestRegistration') ||
                        currentUrl.includes('virtual') ||
                        document.body.innerHTML.includes('virtual participation')) {
                        return { success: false, error: 'VIRTUAL_REGISTRATION_REQUIRED' };
                    }

                    // Check for Cloudflare/Anti-bot
                    if (document.body.innerText.includes('Checking your browser')) {
                        return { success: false, error: 'CLOUDFLARE_CHALLENGE' };
                    }

                    if (!readyEl) return { success: false, error: 'TIMEOUT_NO_FORM_FOUND' };


                    // 2. Locate Form Elements
                    const problemSelect = document.querySelector('select[name="submittedProblemIndex"]');
                    const langSelect = document.querySelector('select[name="programTypeId"]');
                    const sourceBox = document.querySelector('textarea[name="source"]') ||
                        document.getElementById('sourceCodeTextarea');

                    if (!problemSelect || !langSelect) {
                        console.error('Missing fields: Problem=', problemSelect, 'Lang=', langSelect);
                        return { success: false, error: 'FORM_FIELDS_NOT_FOUND' };
                    }

                    // Debug: Log valid options
                    console.log('Valid Problems:', Array.from(problemSelect.options).map(o => o.value));
                    console.log('Valid Langs:', Array.from(langSelect.options).map(o => o.value));

                    // 3. Handle Ace Editor (Toggle to plain text)
                    const toggleBtn = document.querySelector('.toggle-editor-button');
                    // Check if sourceBox is effectively hidden (Ace Editor active)
                    if (toggleBtn && sourceBox && (sourceBox.style.display === 'none' || sourceBox.visibility === 'hidden' || sourceBox.offsetHeight === 0)) {
                        console.log('Toggling Ace Editor to Plain Text...');
                        toggleBtn.click();
                        await new Promise(r => setTimeout(r, 500)); // wait for transition
                    }

                    // 4. Set Problem Index
                    let finalProblemIdx = problemIdx;
                    if (type !== 'acmsguru') {
                        finalProblemIdx = problemIdx.toUpperCase();
                    }

                    console.log('Setting Problem Index to:', finalProblemIdx);
                    problemSelect.value = finalProblemIdx;
                    problemSelect.dispatchEvent(new Event('change', { bubbles: true }));

                    // 5. Set Language
                    let langSet = false;
                    const options = Array.from(langSelect.options);

                    console.log('Setting Language ID to:', langId);
                    // Try exact ID match
                    for (const opt of options) {
                        if (opt.value === String(langId)) {
                            langSelect.value = String(langId);
                            langSet = true;
                            break;
                        }
                    }

                    // If failed, try fuzzy text match
                    if (!langSet) {
                        console.log('ID not found, trying fuzzy match for C++17...');
                        const targetText = "C++17";
                        const bestMatch = options.find(o => o.text.includes(targetText));
                        if (bestMatch) {
                            console.log('Found match:', bestMatch.text);
                            langSelect.value = bestMatch.value;
                            langSet = true;
                        }
                    }

                    if (langSet) {
                        langSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    }

                    // 6. Set Code
                    if (sourceBox) {
                        console.log('Setting Source Code...');
                        sourceBox.value = sourceCode;
                        sourceBox.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // 7. Handle Checkboxes (Agreements)
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        if (!cb.checked) {
                            cb.click();
                        }
                    });

                    // 8. Wait for Anti-Bot / Turnstile / Captcha
                    console.log('Checking for Captcha...');
                    const captchaInput = document.querySelector('input[name="cf-turnstile-response"]') ||
                        document.querySelector('input[name="g-recaptcha-response"]');

                    if (captchaInput) {
                        console.log('Captcha detected. Waiting for resolution...');

                        // Wait up to 15 seconds for captcha to be solved (auto or manual)
                        const captchaStart = Date.now();
                        while (!captchaInput.value && (Date.now() - captchaStart < 15000)) {
                            // Check if we have an error message displayed "Please complete..."
                            if (document.body.innerText.includes('Please complete the anti-bot verification')) {
                                console.log('Captcha challenge visible. Please solve it manually if needed.');
                            }
                            await new Promise(r => setTimeout(r, 500));
                        }

                        if (captchaInput.value) {
                            console.log('Captcha solved! Token:', captchaInput.value.substring(0, 10) + '...');
                        } else {
                            console.warn('Captcha timeout. Trying to submit anyway...');
                        }
                    } else {
                        console.log('No Captcha input found. Proceeding...');
                        // Extra safety wait for "invisible" checks
                        await new Promise(r => setTimeout(r, 2000));
                    }

                    // 9. Submit
                    const submitBtn = document.querySelector('input.submit') ||
                        document.querySelector('button.submit') ||
                        document.querySelector('input[type="submit"]');

                    console.log('Clicking submit button:', submitBtn);

                    if (submitBtn) {
                        submitBtn.click();
                    } else {
                        const form = document.querySelector('form.submit-form');
                        console.log('Submitting form directly:', form);
                        if (form) form.submit();
                        else return { success: false, error: 'NO_SUBMIT_BUTTON' };
                    }

                    return { success: true, submitted: true };

                } catch (e) {
                    console.error('INJECTED SCRIPT ERROR:', e);
                    return { success: false, error: e.toString() };
                }
            }
        });

        const result = results[0]?.result;

        if (!result || !result.success) {
            // Handle Auto-Join Retry
            if (result?.error === 'GYM_JOINING') {
                console.log('🔁 Auto-joined gym. Waiting for navigation and retrying submission in 5s...');
                await chrome.tabs.remove(tab.id); // Close the join tab
                await new Promise(r => setTimeout(r, 5000));
                return handleSubmission({ contestId, problemIndex, code, language, urlType, groupId }, attempt + 1);
            }

            // DEBUG: Keep tab open to see error!
            // await chrome.tabs.remove(tab.id); 
            console.error('Submission failed on page:', result?.error);
            return { success: false, error: result?.error || 'Failed to submit - Check the opened tab' };
        }

        // Wait for result redirect - INCREASED TIMEOUT
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Final check on result URL and extract submission ID
        const finalCheck = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const url = window.location.href;
                const body = document.body.innerText;

                // Debug logging
                console.log('Final URL:', url);

                if (body.includes('submitted exactly the same code')) return { success: false, error: 'DUPLICATE_SUBMISSION' };

                // Try to extract submission ID from various sources
                let submissionId = null;

                // Method 1: From URL (e.g., /my or /status page might have submission ID in URL or table)
                const urlMatch = url.match(/submission\/(\d+)/);
                if (urlMatch) {
                    submissionId = urlMatch[1];
                }

                // Method 2: From the first row of the submissions table
                if (!submissionId) {
                    const firstRow = document.querySelector('table.status-frame-datatable tr[data-submission-id]');
                    if (firstRow) {
                        submissionId = firstRow.getAttribute('data-submission-id');
                    }
                }

                // Method 3: From the first submission link in the table
                if (!submissionId) {
                    const subLink = document.querySelector('table.status-frame-datatable a[href*="/submission/"]');
                    if (subLink) {
                        const match = subLink.href.match(/\/submission\/(\d+)/);
                        if (match) submissionId = match[1];
                    }
                }

                // Method 4: From the first cell with submission ID
                if (!submissionId) {
                    const firstCell = document.querySelector('table.status-frame-datatable td.id-cell');
                    if (firstCell) {
                        submissionId = firstCell.textContent.trim();
                    }
                }

                if (url.includes('/my') || url.includes('/status')) {
                    return { success: true, url, submissionId };
                }

                // If we are still on submit page, it failed!
                if (url.includes('/submit')) {
                    // Try to find an error message on the page
                    const errorSpan = document.querySelector('.error') || document.querySelector('.field-error');
                    const errorMsg = errorSpan ? errorSpan.innerText : 'Unknown Codeforces Error';
                    return { success: false, error: errorMsg };
                }

                return { success: true, url, submissionId }; // Assume success if navigated away
            }
        });

        let finalRes = finalCheck[0]?.result || { success: true };

        // If we didn't get a submission ID from HTML, OR if it was a duplicate, try the API
        if ((finalRes.success && !finalRes.submissionId) || finalRes.error === 'DUPLICATE_SUBMISSION') {
            const reason = finalRes.error || 'No ID in HTML';
            console.log('📡 No submission ID captured immediately. Fetching latest submission to recover...', { reason });

            // Allow a small delay for API to update
            await new Promise(r => setTimeout(r, 2000));

            const latestSubmission = await getLatestSubmission(contestId, problemIndex);
            if (latestSubmission) {
                finalRes.submissionId = String(latestSubmission.id);
                finalRes.verdict = latestSubmission.verdict || 'TESTING';

                // If we recovered a duplicate, mark it as success
                if (finalRes.error === 'DUPLICATE_SUBMISSION') {
                    finalRes.success = true;
                    delete finalRes.error;
                }

                console.log('✅ Got submission ID from API:', finalRes.submissionId);
            }
        }

        // Fetch user handle to allow client-side API polling
        try {
            const loginInfo = await checkLoginStatus();
            if (loginInfo.loggedIn && loginInfo.handle) {
                finalRes.handle = loginInfo.handle;
            }
        } catch (e) {
            console.warn('Failed to fetch handle for response:', e);
        }

        // Add problem index to the response for proper API tracking
        finalRes.problemIndex = problemIndex;
        finalRes.contestId = contestId;

        // Only close if successful
        if (finalRes.success) {
            await chrome.tabs.remove(tab.id);
        } else {
            console.error('Submission failed validation:', finalRes.error);
        }

        return finalRes;

    } catch (error) {
        console.error('Submission Manager Error:', error);

        // Handle specific Chrome extension errors with user-friendly messages
        let userMessage = error.message;

        if (error.message?.includes('Tabs cannot be edited')) {
            userMessage = 'Chrome was busy. Please try again in a moment.';
        } else if (error.message?.includes('No tab with id')) {
            userMessage = 'Tab was closed unexpectedly. Please try again.';
        } else if (error.message?.includes('Extension context invalidated')) {
            userMessage = 'Extension reloaded. Please refresh the page and try again.';
        } else if (error.message?.includes('Failed to fetch')) {
            userMessage = 'Network error. Check your connection and try again.';
        }

        return { success: false, error: userMessage };
    }
}

/**
 * Helper to fetch compilation error details
 */
async function getCompilationError(contestId, submissionId) {
    try {
        const url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
        const response = await fetch(url, { credentials: 'include' });
        const text = await response.text();


        // Look for the specific source code / judge protocol block
        // This is heuristic-based as CF DOM changes.
        const jsonMatch = text.match(/judgeProtocol\s*=\s*({[\s\S]*?});/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            return data.protocol || data.comment || 'Check submission page for details.';
        }

        return 'Detailed validation log not found. Please check on Codeforces.';
    } catch (e) {
        console.warn('Failed to fetch CE details:', e);
        return null;
    }
}

/**
 * Fallback: Scrape status using a real tab (bypasses Fetch limits/Cloudflare)
 */
async function scrapeUsingTab(url) {
    console.log('🕵️‍♂️ Starting Tab Scraper for:', url);
    let tabId = null;
    try {
        const tab = await chrome.tabs.create({ url, active: false });
        tabId = tab.id;

        // Wait for load
        await new Promise(r => setTimeout(r, 3000));

        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const text = document.body.innerText;
                void document.body.innerHTML; // Capture but not used (available for future)

                let verdict = 'Unknown';
                let isWaiting = false;
                let testNum = 0;

                // Check active states
                if (text.includes('In queue') || text.includes('in queue')) {
                    verdict = 'In queue';
                    isWaiting = true;
                } else if (text.includes('Running on test')) {
                    verdict = 'Testing';
                    isWaiting = true;
                    const match = text.match(/Running on test (\d+)/);
                    if (match) testNum = parseInt(match[1]);
                } else {
                    // Check verdict text
                    const lowerText = text.toLowerCase();
                    if (lowerText.includes('compilation error')) verdict = 'Compilation Error';
                    else if (lowerText.includes('accepted') && !lowerText.includes('not accepted')) verdict = 'Accepted';
                    else if (lowerText.includes('wrong answer')) verdict = 'Wrong Answer';
                    else if (lowerText.includes('time limit exceeded')) verdict = 'Time Limit Exceeded';
                    else if (lowerText.includes('memory limit exceeded')) verdict = 'Memory Limit Exceeded';
                    else if (lowerText.includes('runtime error')) verdict = 'Runtime Error';
                }

                // Parse metrics
                let timeMs = 0;
                let memoryKb = 0;
                const timeMatch = text.match(/(\d+)\s*ms/i);
                if (timeMatch) timeMs = parseInt(timeMatch[1]);
                const memMatch = text.match(/(\d+)\s*KB/i);
                if (memMatch) memoryKb = parseInt(memMatch[1]);

                return { verdict, isWaiting, testNum, timeMs, memoryKb };
            }
        });

        const res = results[0]?.result;
        await chrome.tabs.remove(tabId);

        if (res) {
            return {
                success: true,
                verdict: res.verdict,
                waiting: res.isWaiting,
                testNumber: res.testNumber,
                time: res.timeMs,
                memory: res.memoryKb
            };
        }
        return { success: false, error: 'Tab scrape failed' };

    } catch (e) {
        console.error('Tab scraper error:', e);
        if (tabId) try { await chrome.tabs.remove(tabId); } catch { }
        return { success: false, error: e.message };
    }
}

console.log('🧩 Verdict Helper extension loaded');
