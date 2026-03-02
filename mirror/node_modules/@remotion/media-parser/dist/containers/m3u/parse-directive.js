"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseM3uDirective = void 0;
const parse_m3u_media_directive_1 = require("./parse-m3u-media-directive");
const parse_stream_inf_1 = require("./parse-stream-inf");
const parseM3uDirective = (str) => {
    const firstColon = str.indexOf(':');
    const directive = (firstColon === -1 ? str : str.slice(0, firstColon)).trim();
    const value = firstColon === -1 ? null : str.slice(firstColon + 1);
    if (directive === '#EXT-X-VERSION') {
        if (!value) {
            throw new Error('EXT-X-VERSION directive must have a value');
        }
        return {
            type: 'm3u-version',
            version: value,
        };
    }
    if (directive === '#EXT-X-INDEPENDENT-SEGMENTS') {
        return {
            type: 'm3u-independent-segments',
        };
    }
    if (directive === '#EXT-X-MEDIA') {
        if (!value) {
            throw new Error('EXT-X-MEDIA directive must have a value');
        }
        const parsed = (0, parse_m3u_media_directive_1.parseM3uMediaDirective)(value);
        return parsed;
    }
    if (directive === '#EXT-X-TARGETDURATION') {
        if (!value) {
            throw new Error('EXT-X-TARGETDURATION directive must have a value');
        }
        return {
            type: 'm3u-target-duration',
            duration: parseFloat(value),
        };
    }
    if (directive === '#EXTINF') {
        if (!value) {
            throw new Error('EXTINF has no value');
        }
        return {
            type: 'm3u-extinf',
            value: parseFloat(value),
        };
    }
    if (directive === '#EXT-X-ENDLIST') {
        return {
            type: 'm3u-endlist',
        };
    }
    if (directive === '#EXT-X-PLAYLIST-TYPE') {
        if (!value) {
            throw new Error('#EXT-X-PLAYLIST-TYPE. directive must have a value');
        }
        return {
            type: 'm3u-playlist-type',
            playlistType: value,
        };
    }
    if (directive === '#EXT-X-MEDIA-SEQUENCE') {
        if (!value) {
            throw new Error('#EXT-X-MEDIA-SEQUENCE directive must have a value');
        }
        return {
            type: 'm3u-media-sequence',
            value: Number(value),
        };
    }
    if (directive === '#EXT-X-DISCONTINUITY-SEQUENCE') {
        if (!value) {
            throw new Error('#EXT-X-DISCONTINUITY-SEQUENCE directive must have a value');
        }
        return {
            type: 'm3u-discontinuity-sequence',
            value: Number(value),
        };
    }
    if (directive === '#EXT-X-STREAM-INF') {
        if (!value) {
            throw new Error('EXT-X-STREAM-INF directive must have a value');
        }
        const res = (0, parse_stream_inf_1.parseStreamInf)(value);
        return res;
    }
    if (directive === '#EXT-X-I-FRAME-STREAM-INF') {
        return {
            type: 'm3u-i-frame-stream-info',
        };
    }
    if (directive === '#EXT-X-ALLOW-CACHE') {
        if (!value) {
            throw new Error('#EXT-X-ALLOW-CACHE directive must have a value');
        }
        return {
            type: 'm3u-allow-cache',
            allowsCache: value === 'YES',
        };
    }
    if (directive === '#EXT-X-MAP') {
        if (!value) {
            throw new Error('#EXT-X-MAP directive must have a value');
        }
        const p = (0, parse_m3u_media_directive_1.parseM3uKeyValue)(value);
        if (!p.URI) {
            throw new Error('EXT-X-MAP directive must have a URI');
        }
        return {
            type: 'm3u-map',
            value: p.URI,
        };
    }
    if (directive === '#EXT-X-PROGRAM-DATE-TIME') {
        if (!value) {
            throw new Error('#EXT-X-PROGRAM-DATE-TIME directive must have a value');
        }
        // Store the raw ISO 8601 date-time string without validation.
        // This directive associates media segments with absolute dates but
        // doesn't affect parsing of tracks, dimensions, or other metadata.
        return {
            type: 'm3u-program-date-time',
            dateTime: value,
        };
    }
    throw new Error(`Unknown directive ${directive}. Value: ${value}`);
};
exports.parseM3uDirective = parseM3uDirective;
