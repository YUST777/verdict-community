"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseM3uMediaDirective = exports.parseM3uKeyValue = void 0;
const parse_stream_inf_1 = require("./parse-stream-inf");
const parseM3uKeyValue = (str) => {
    const quotes = (0, parse_stream_inf_1.splitRespectingQuotes)(str);
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
    return map;
};
exports.parseM3uKeyValue = parseM3uKeyValue;
const parseM3uMediaDirective = (str) => {
    const map = (0, exports.parseM3uKeyValue)(str);
    return {
        type: 'm3u-media-info',
        autoselect: map.AUTOSELECT === 'YES',
        channels: map.CHANNELS ? parseInt(map.CHANNELS, 10) : null,
        default: map.DEFAULT === 'YES',
        groupId: map['GROUP-ID'],
        language: map.LANGUAGE || null,
        name: map.NAME || null,
        uri: map.URI,
        mediaType: map.TYPE || null,
    };
};
exports.parseM3uMediaDirective = parseM3uMediaDirective;
