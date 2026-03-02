"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUsageEvent = exports.internalRegisterUsageEvent = exports.sleep = exports.exponentialBackoffMs = exports.HOST = void 0;
exports.HOST = 'https://www.remotion.pro';
const is_network_error_1 = require("./is-network-error");
const DEFAULT_MAX_RETRIES = 3;
const exponentialBackoffMs = (attempt) => {
    return 1000 * 2 ** (attempt - 1);
};
exports.exponentialBackoffMs = exponentialBackoffMs;
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
exports.sleep = sleep;
const internalRegisterUsageEvent = async ({ host, succeeded, event, isStill, isProduction, licenseKey, }) => {
    let lastError;
    const totalAttempts = DEFAULT_MAX_RETRIES + 1;
    for (let attempt = 1; attempt <= totalAttempts; attempt++) {
        const abortController = new AbortController();
        const timeout = setTimeout(() => {
            abortController.abort();
        }, 10000);
        try {
            const res = await fetch(`${exports.HOST}/api/track/register-usage-point`, {
                method: 'POST',
                body: JSON.stringify({
                    event,
                    apiKey: licenseKey,
                    host,
                    succeeded,
                    isStill,
                    isProduction,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: abortController.signal,
            });
            clearTimeout(timeout);
            const json = (await res.json());
            if (json.success) {
                return {
                    billable: json.billable,
                    classification: json.classification,
                };
            }
            if (!res.ok) {
                throw new Error(json.error);
            }
            throw new Error(`Unexpected response from server: ${JSON.stringify(json)}`);
        }
        catch (err) {
            clearTimeout(timeout);
            const error = err;
            const isTimeout = error.name === 'AbortError';
            const isRetryable = (0, is_network_error_1.isNetworkError)(error) || isTimeout;
            if (!isRetryable) {
                throw err;
            }
            lastError = isTimeout
                ? new Error('Request timed out after 10 seconds')
                : error;
            if (attempt < totalAttempts) {
                const backoffMs = (0, exports.exponentialBackoffMs)(attempt);
                // eslint-disable-next-line no-console
                console.log(`Failed to send usage event (attempt ${attempt}/${totalAttempts}), retrying in ${backoffMs}ms...`, err);
                await (0, exports.sleep)(backoffMs);
            }
        }
    }
    throw lastError;
};
exports.internalRegisterUsageEvent = internalRegisterUsageEvent;
const registerUsageEvent = (options) => {
    var _a, _b, _c;
    const licenseKey = 'licenseKey' in options ? options.licenseKey : null;
    const apiKey = 'apiKey' in options ? options.apiKey : null;
    return (0, exports.internalRegisterUsageEvent)({
        ...options,
        isStill: (_a = options.isStill) !== null && _a !== void 0 ? _a : false,
        isProduction: (_b = options.isProduction) !== null && _b !== void 0 ? _b : true,
        licenseKey: (_c = licenseKey !== null && licenseKey !== void 0 ? licenseKey : apiKey) !== null && _c !== void 0 ? _c : null,
    });
};
exports.registerUsageEvent = registerUsageEvent;
