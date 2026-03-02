"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStreamInf = void 0;
exports.splitRespectingQuotes = splitRespectingQuotes;
function splitRespectingQuotes(input) {
    const result = [];
    let currentPart = '';
    let insideQuote = false;
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        // Toggle flag when encountering a quote character.
        if (char === '"') {
            insideQuote = !insideQuote;
            currentPart += char;
        }
        // If we encounter a comma and we are NOT inside a quoted substring
        else if (char === ',' && !insideQuote) {
            result.push(currentPart);
            currentPart = '';
        }
        else {
            currentPart += char;
        }
    }
    // Push the last token, if any.
    if (currentPart) {
        result.push(currentPart);
    }
    return result;
}
const parseStreamInf = (str) => {
    const quotes = splitRespectingQuotes(str);
    const map = {};
    for (const quote of quotes) {
        const firstColon = quote.indexOf('=');
        const key = firstColon === -1 ? quote : quote.slice(0, firstColon);
        const value = firstColon === -1 ? null : quote.slice(firstColon + 1);
        if (value === null) {
            throw new Error('Value is null');
        }
        const actualValue = (value === null || value === void 0 ? void 0 : value.startsWith('"')) && (value === null || value === void 0 ? void 0 : value.endsWith('"'))
            ? value.slice(1, -1)
            : value;
        map[key] = actualValue;
    }
    return {
        type: 'm3u-stream-info',
        averageBandwidthInBitsPerSec: map['AVERAGE-BANDWIDTH']
            ? parseInt(map['AVERAGE-BANDWIDTH'], 10)
            : null,
        bandwidthInBitsPerSec: map.BANDWIDTH ? parseInt(map.BANDWIDTH, 10) : null,
        codecs: map.CODECS ? map.CODECS.split(',') : null,
        dimensions: map.RESOLUTION
            ? {
                width: parseInt(map.RESOLUTION.split('x')[0], 10),
                height: parseInt(map.RESOLUTION.split('x')[1], 10),
            }
            : null,
        audio: map.AUDIO || null,
    };
};
exports.parseStreamInf = parseStreamInf;
