"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unregisterClientRender = exports.registerClientRender = exports.saveOutputFile = void 0;
const throwIfNotOk = async (response) => {
    if (!response.ok) {
        try {
            const jsonResponse = await response.json();
            throw new Error(jsonResponse.error);
        }
        catch (parseError) {
            if (parseError instanceof Error && parseError.message) {
                throw parseError;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }
};
const saveOutputFile = async ({ blob, filePath, }) => {
    const url = new URL('/api/upload-output', window.location.origin);
    url.search = new URLSearchParams({ filePath }).toString();
    const response = await fetch(url, {
        method: 'POST',
        body: blob,
    });
    await throwIfNotOk(response);
};
exports.saveOutputFile = saveOutputFile;
const registerClientRender = async (render) => {
    const response = await fetch('/api/register-client-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(render),
    });
    await throwIfNotOk(response);
};
exports.registerClientRender = registerClientRender;
const unregisterClientRender = async (id) => {
    const response = await fetch('/api/unregister-client-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    await throwIfNotOk(response);
};
exports.unregisterClientRender = unregisterClientRender;
