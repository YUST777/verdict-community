"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMedia = void 0;
const select_stream_1 = require("./containers/m3u/select-stream");
const internal_parse_media_1 = require("./internal-parse-media");
const web_1 = require("./web");
const parseMedia = (options) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
    if (!options) {
        return Promise.reject(new Error('No options provided. See https://www.remotion.dev/media-parser for how to get started.'));
    }
    return (0, internal_parse_media_1.internalParseMedia)({
        fields: (_a = options.fields) !== null && _a !== void 0 ? _a : null,
        logLevel: (_b = options.logLevel) !== null && _b !== void 0 ? _b : 'info',
        onAudioCodec: (_c = options.onAudioCodec) !== null && _c !== void 0 ? _c : null,
        onAudioTrack: (_d = options.onAudioTrack) !== null && _d !== void 0 ? _d : null,
        onContainer: (_e = options.onContainer) !== null && _e !== void 0 ? _e : null,
        onDimensions: (_f = options.onDimensions) !== null && _f !== void 0 ? _f : null,
        onDurationInSeconds: (_g = options.onDurationInSeconds) !== null && _g !== void 0 ? _g : null,
        onFps: (_h = options.onFps) !== null && _h !== void 0 ? _h : null,
        onImages: (_j = options.onImages) !== null && _j !== void 0 ? _j : null,
        onInternalStats: (_k = options.onInternalStats) !== null && _k !== void 0 ? _k : null,
        onIsHdr: (_l = options.onIsHdr) !== null && _l !== void 0 ? _l : null,
        onKeyframes: (_m = options.onKeyframes) !== null && _m !== void 0 ? _m : null,
        onLocation: (_o = options.onLocation) !== null && _o !== void 0 ? _o : null,
        onMetadata: (_p = options.onMetadata) !== null && _p !== void 0 ? _p : null,
        onMimeType: (_q = options.onMimeType) !== null && _q !== void 0 ? _q : null,
        onName: (_r = options.onName) !== null && _r !== void 0 ? _r : null,
        onNumberOfAudioChannels: (_s = options.onNumberOfAudioChannels) !== null && _s !== void 0 ? _s : null,
        onParseProgress: (_t = options.onParseProgress) !== null && _t !== void 0 ? _t : null,
        onRotation: (_u = options.onRotation) !== null && _u !== void 0 ? _u : null,
        onSampleRate: (_v = options.onSampleRate) !== null && _v !== void 0 ? _v : null,
        onSize: (_w = options.onSize) !== null && _w !== void 0 ? _w : null,
        onSlowAudioBitrate: (_x = options.onSlowAudioBitrate) !== null && _x !== void 0 ? _x : null,
        onSlowDurationInSeconds: (_y = options.onSlowDurationInSeconds) !== null && _y !== void 0 ? _y : null,
        onSlowFps: (_z = options.onSlowFps) !== null && _z !== void 0 ? _z : null,
        onSlowKeyframes: (_0 = options.onSlowKeyframes) !== null && _0 !== void 0 ? _0 : null,
        onSlowNumberOfFrames: (_1 = options.onSlowNumberOfFrames) !== null && _1 !== void 0 ? _1 : null,
        onSlowVideoBitrate: (_2 = options.onSlowVideoBitrate) !== null && _2 !== void 0 ? _2 : null,
        onSlowStructure: (_3 = options.onSlowStructure) !== null && _3 !== void 0 ? _3 : null,
        onM3uStreams: (_4 = options.onM3uStreams) !== null && _4 !== void 0 ? _4 : null,
        onTracks: (_5 = options.onTracks) !== null && _5 !== void 0 ? _5 : null,
        onUnrotatedDimensions: (_6 = options.onUnrotatedDimensions) !== null && _6 !== void 0 ? _6 : null,
        onVideoCodec: (_7 = options.onVideoCodec) !== null && _7 !== void 0 ? _7 : null,
        onVideoTrack: (_8 = options.onVideoTrack) !== null && _8 !== void 0 ? _8 : null,
        progressIntervalInMs: (_9 = options.progressIntervalInMs) !== null && _9 !== void 0 ? _9 : null,
        reader: (_10 = options.reader) !== null && _10 !== void 0 ? _10 : web_1.webReader,
        controller: (_11 = options.controller) !== null && _11 !== void 0 ? _11 : undefined,
        selectM3uStream: (_12 = options.selectM3uStream) !== null && _12 !== void 0 ? _12 : select_stream_1.defaultSelectM3uStreamFn,
        selectM3uAssociatedPlaylists: (_13 = options.selectM3uAssociatedPlaylists) !== null && _13 !== void 0 ? _13 : select_stream_1.defaultSelectM3uAssociatedPlaylists,
        m3uPlaylistContext: (_14 = options.m3uPlaylistContext) !== null && _14 !== void 0 ? _14 : null,
        src: options.src,
        mode: 'query',
        onDiscardedData: null,
        onError: () => ({ action: 'fail' }),
        acknowledgeRemotionLicense: Boolean(options.acknowledgeRemotionLicense),
        apiName: 'parseMedia()',
        makeSamplesStartAtZero: (_15 = options.makeSamplesStartAtZero) !== null && _15 !== void 0 ? _15 : true,
        seekingHints: (_16 = options.seekingHints) !== null && _16 !== void 0 ? _16 : null,
    });
};
exports.parseMedia = parseMedia;
