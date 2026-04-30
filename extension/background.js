/**
 * Verdict Helper Extension v1.0.9 — Background Service Worker
 *
 * Cookie-only approach: extracts CF cookies for server-side submission.
 *
 * Architecture:
 * ─────────────────────────────────────────────────────────────────────────
 * The scrapling bridge (server-side) opens its own headless browser session
 * using the user's cookies. It handles CSRF, Turnstile, ftaa, bfaa, _tta
 * all server-side. The extension's ONLY job is:
 *   1. Extract CF cookies (for session auth)
 *   2. Check login status + resolve handle
 *   3. Provide cookies to the page for server-side submission
 *
 * Handle resolution: CF doesn't always set a "handle" cookie.
 * When session cookies exist but no handle cookie, we fetch the CF
 * homepage ONCE and cache the handle for the session. This is 1 request
 * total (not per-submit like v1.0.8's CSRF fetch).
 */

// ─── Handle cache ────────────────────────────────────────────────────
let handleCache = {
    handle: null,
    sessionKey: null, // changes when session cookies change
};

function getSessionKey(rawCookies) {
    const sessionCookies = rawCookies
        .filter(c => c.name === 'JSESSIONID' || c.name === '39ce7' || c.name === 'X-User-Sha1')
        .map(c => `${c.name}=${c.value}`)
        .sort()
        .join('|');
    return sessionCookies || null;
}

// Invalidate handle cache when session cookies change (login/logout)
chrome.cookies.onChanged.addListener((changeInfo) => {
    const name = changeInfo.cookie.name;
    if (changeInfo.cookie.domain.includes('codeforces.com') &&
        (name === 'JSESSIONID' || name === '39ce7' || name === 'X-User-Sha1' || name === 'handle')) {
        handleCache.handle = null;
        handleCache.sessionKey = null;
    }
});

// ─── Cookie Extraction ───────────────────────────────────────────────
async function getCodeforcesCookies() {
    try {
        const cookies = await chrome.cookies.getAll({ domain: '.codeforces.com' });
        const cookies2 = await chrome.cookies.getAll({ domain: 'codeforces.com' });

        const seen = new Set();
        const all = [];
        for (const c of [...cookies, ...cookies2]) {
            if (!seen.has(c.name)) {
                seen.add(c.name);
                all.push(c);
            }
        }

        const cookieString = all.map(c => `${c.name}=${c.value}`).join('; ');
        return { success: true, cookies: cookieString, raw: all };
    } catch (err) {
        console.error('Cookie extraction failed:', err);
        return { success: false, error: err.message };
    }
}

// ─── Login Check (cookies first, single fetch fallback for handle) ───
async function checkLogin() {
    try {
        const cookieResult = await getCodeforcesCookies();
        if (!cookieResult.success) {
            return { loggedIn: false };
        }

        const raw = cookieResult.raw || [];

        // 1. Check handle cookie (fastest path, zero requests)
        const handleCookie = raw.find(c => c.name === 'handle');
        if (handleCookie) {
            return { loggedIn: true, handle: handleCookie.value };
        }

        // 2. Check session cookies exist
        const hasSession = raw.some(c =>
            c.name === 'X-User-Sha1' ||
            c.name === '39ce7' ||
            c.name === 'JSESSIONID'
        );

        if (!hasSession) {
            return { loggedIn: false };
        }

        // 3. Session cookies exist but no handle cookie — check cache
        const currentSessionKey = getSessionKey(raw);
        if (handleCache.handle && handleCache.sessionKey === currentSessionKey) {
            return { loggedIn: true, handle: handleCache.handle };
        }

        // 4. Fetch CF homepage ONCE to resolve handle (cached for session)
        try {
            const res = await fetch('https://codeforces.com/', {
                credentials: 'include',
                headers: { 'User-Agent': navigator.userAgent }
            });
            const html = await res.text();

            const handleMatch = html.match(/href="\/profile\/([^"]+)"/);
            if (handleMatch && handleMatch[1]) {
                handleCache.handle = handleMatch[1];
                handleCache.sessionKey = currentSessionKey;
                return { loggedIn: true, handle: handleMatch[1] };
            }

            // Logged in but can't find handle (rare)
            if (html.includes('/logout')) {
                return { loggedIn: true, handle: null };
            }
        } catch {
            // Network fail — assume logged in if session cookies exist
            return { loggedIn: true, handle: null };
        }

        return { loggedIn: true, handle: null };
    } catch {
        return { loggedIn: false };
    }
}

// ─── Message Handler ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_CF_COOKIES') {
        getCodeforcesCookies().then(sendResponse);
        return true;
    }

    if (message.type === 'GET_CSRF_TOKEN') {
        // Bridge handles CSRF server-side. Return placeholder.
        sendResponse({ success: true, csrfToken: 'bridge-handles-csrf' });
        return true;
    }

    if (message.type === 'CHECK_CF_LOGIN' || message.action === 'checkLoginStatus') {
        checkLogin().then(sendResponse);
        return true;
    }

    if (message.type === 'GET_CF_HANDLE') {
        checkLogin().then(result => {
            sendResponse({ handle: result.handle || null });
        });
        return true;
    }

    if (message.action === 'ping') {
        sendResponse({ status: 'pong', version: '1.0.9' });
        return true;
    }
});

console.log('🧩 Verdict Helper v1.0.9 loaded (cookie-only, handle cached per-session)');
