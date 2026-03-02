"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNetworkError = isNetworkError;
function isNetworkError(error) {
    if (
    // Chrome
    error.message.includes('Failed to fetch') ||
        // Safari
        error.message.includes('Load failed') ||
        // Firefox
        error.message.includes('NetworkError when attempting to fetch resource')) {
        return true;
    }
    return false;
}
