// content_script.js - Runs on Verdict.run website
// Bridges communication between the website and the extension

(function () {
    'use strict';

    console.log('🧩 Verdict Helper content script loaded');

    // Inject a marker so the website knows the extension is installed
    // Inject a marker so the website knows the extension is installed
    // Append to body to avoid hydration mismatches on html tag
    if (document.body) {
        const marker = document.createElement('div');
        marker.id = 'verdict-extension-installed';
        marker.style.display = 'none';
        marker.dataset.version = '1.0.3';
        document.body.appendChild(marker);
    } else {
        // Fallback if body not ready (run_at document_start)
        document.addEventListener('DOMContentLoaded', () => {
            const marker = document.createElement('div');
            marker.id = 'verdict-extension-installed';
            marker.style.display = 'none';
            marker.dataset.version = '1.0.3';
            document.body.appendChild(marker);
        });
    }

    // Listen for messages from the website
    window.addEventListener('message', async (event) => {
        // Security: only accept messages from the same window
        if (event.source !== window) return;

        const { type, payload } = event.data;
        if (!type) return;

        // Handle different message types
        switch (type) {
            case 'VERDICT_PING':
                // Website is checking if extension is installed
                window.postMessage({
                    type: 'VERDICT_PONG',
                    version: '1.0.3'
                }, '*');
                break;

            case 'VERDICT_CHECK_LOGIN':
                // Check Codeforces login status
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkLoginStatus'
                    });
                    window.postMessage({
                        type: 'VERDICT_LOGIN_STATUS',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'VERDICT_LOGIN_STATUS',
                        loggedIn: false,
                        error: error.message
                    }, '*');
                }
                break;

            case 'VERDICT_SUBMIT':
                // Submit code to Codeforces
                console.log('📤 Received submission request:', JSON.stringify(payload, null, 2));

                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'submitToCF',
                        data: payload
                    });

                    window.postMessage({
                        type: 'VERDICT_SUBMISSION_RESULT',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'VERDICT_SUBMISSION_RESULT',
                        success: false,
                        error: error.message
                    }, '*');
                }
                break;

            case 'VERDICT_CHECK_SUBMISSION':
                // Check submission status
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkSubmissionStatus',
                        data: payload
                    });

                    window.postMessage({
                        type: 'VERDICT_SUBMISSION_STATUS_RESULT',
                        ...response
                    }, '*');
                } catch (error) {
                    window.postMessage({
                        type: 'VERDICT_SUBMISSION_STATUS_RESULT',
                        success: false,
                        error: error.message
                    }, '*');
                }
                break;

            case 'VERDICT_GET_HANDLE':
                // Get Codeforces handle from extension
                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'checkLoginStatus'
                    });
                    window.postMessage({
                        type: 'VERDICT_HANDLE_RESPONSE',
                        handle: response.handle || null
                    }, '*');
                } catch {
                    window.postMessage({
                        type: 'VERDICT_HANDLE_RESPONSE',
                        handle: null
                    }, '*');
                }
                break;

            default:
                // Ignore unknown message types
                break;
        }
    });

    // Dispatch a custom event to notify the page that extension is ready
    window.dispatchEvent(new CustomEvent('verdict-extension-ready', {
        detail: { version: '1.0.3' }
    }));

})();
