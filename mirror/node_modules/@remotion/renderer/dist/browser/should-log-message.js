"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChromeLogLocation = exports.formatChromeMessage = exports.shouldLogBrowserMessage = void 0;
const parse_browser_log_message_1 = require("./parse-browser-log-message");
const shouldLogBrowserMessage = (message) => {
    // Not relevant for the user
    if (message.startsWith('DevTools listening on')) {
        return false;
    }
    // In Ubuntu GitHub Action
    if (message.includes('Falling back to ALSA for audio output')) {
        return false;
    }
    // In Ubuntu GitHub Action
    if (message.includes('Floss manager not present, cannot set Floss enable/disable')) {
        return false;
    }
    // Noisy but harmless warning
    if (message.includes('Failed to send GpuControl.CreateCommandBuffer')) {
        return false;
    }
    if (message.includes('CreatePlatformSocket() failed: Address family not supported by protocol')) {
        return false;
    }
    if (message.includes('Fontconfig error: No writable cache directories')) {
        return false;
    }
    if (message.includes('AttributionReportingCrossAppWeb cannot be enabled in this configuration')) {
        return false;
    }
    if (message.includes('Trying to Produce a Memory representation from a non-existent mailbox.')) {
        return false;
    }
    if (message.includes('Received HEADERS for invalid stream')) {
        return false;
    }
    if (message.includes('CVDisplayLinkCreateWithCGDisplay failed')) {
        return false;
    }
    if (message.includes('Falling back to ALSA for audio output')) {
        return false;
    }
    if (message.includes('VizNullHypothesis is disabled')) {
        return false;
    }
    return true;
};
exports.shouldLogBrowserMessage = shouldLogBrowserMessage;
const formatChromeMessage = (input) => {
    const parsed = (0, parse_browser_log_message_1.parseBrowserLogMessage)(input);
    if (!parsed) {
        return { output: input, tag: 'chrome' };
    }
    const { location, lineNumber, message } = parsed;
    // Don't print console.log's, these are handled through the WebSocket
    if (location === 'CONSOLE') {
        return null;
    }
    return { output: `${location}:${lineNumber}: ${message}`, tag: 'chrome' };
};
exports.formatChromeMessage = formatChromeMessage;
const parseChromeLogLocation = (message) => {
    const regex = /(.*), source: (.*) \(([0-9]+)\)/;
    const match = message.match(regex);
    if (!match) {
        return null;
    }
    return {
        lineNumber: parseInt(match[3], 10),
        location: match[2],
    };
};
exports.parseChromeLogLocation = parseChromeLogLocation;
