"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAndParseMedia = void 0;
const select_stream_1 = require("./containers/m3u/select-stream");
const internal_parse_media_1 = require("./internal-parse-media");
const log_1 = require("./log");
const web_1 = require("./web");
const downloadAndParseMedia = async (options) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
    if (!options) {
        return Promise.reject(new Error('No options provided. See https://www.remotion.dev/media-parser for how to get started.'));
    }
    const logLevel = (_a = options.logLevel) !== null && _a !== void 0 ? _a : 'info';
    const content = await options.writer.createContent({
        filename: 'hmm',
        mimeType: 'shouldnotmatter',
        logLevel,
    });
    const returnValue = await (0, internal_parse_media_1.internalParseMedia)({
        fields: (_b = options.fields) !== null && _b !== void 0 ? _b : null,
        logLevel,
        mode: 'download',
        onAudioCodec: (_c = options.onAudioCodec) !== null && _c !== void 0 ? _c : null,
        onAudioTrack: (_d = options.onAudioTrack) !== null && _d !== void 0 ? _d : null,
        onContainer: (_e = options.onContainer) !== null && _e !== void 0 ? _e : null,
        onDimensions: (_f = options.onDimensions) !== null && _f !== void 0 ? _f : null,
        selectM3uStream: (_g = options.selectM3uStream) !== null && _g !== void 0 ? _g : select_stream_1.defaultSelectM3uStreamFn,
        selectM3uAssociatedPlaylists: (_h = options.selectM3uAssociatedPlaylists) !== null && _h !== void 0 ? _h : select_stream_1.defaultSelectM3uAssociatedPlaylists,
        m3uPlaylistContext: (_j = options.m3uPlaylistContext) !== null && _j !== void 0 ? _j : null,
        onDiscardedData: async (data) => {
            await content.write(data);
        },
        onDurationInSeconds: (_k = options.onDurationInSeconds) !== null && _k !== void 0 ? _k : null,
        onFps: (_l = options.onFps) !== null && _l !== void 0 ? _l : null,
        onImages: (_m = options.onImages) !== null && _m !== void 0 ? _m : null,
        onInternalStats: (_o = options.onInternalStats) !== null && _o !== void 0 ? _o : null,
        onIsHdr: (_p = options.onIsHdr) !== null && _p !== void 0 ? _p : null,
        onKeyframes: (_q = options.onKeyframes) !== null && _q !== void 0 ? _q : null,
        onLocation: (_r = options.onLocation) !== null && _r !== void 0 ? _r : null,
        onMetadata: (_s = options.onMetadata) !== null && _s !== void 0 ? _s : null,
        onMimeType: (_t = options.onMimeType) !== null && _t !== void 0 ? _t : null,
        onName: (_u = options.onName) !== null && _u !== void 0 ? _u : null,
        onNumberOfAudioChannels: (_v = options.onNumberOfAudioChannels) !== null && _v !== void 0 ? _v : null,
        onParseProgress: (_w = options.onParseProgress) !== null && _w !== void 0 ? _w : null,
        onRotation: (_x = options.onRotation) !== null && _x !== void 0 ? _x : null,
        onSampleRate: (_y = options.onSampleRate) !== null && _y !== void 0 ? _y : null,
        onSize: (_z = options.onSize) !== null && _z !== void 0 ? _z : null,
        onSlowAudioBitrate: (_0 = options.onSlowAudioBitrate) !== null && _0 !== void 0 ? _0 : null,
        onSlowDurationInSeconds: (_1 = options.onSlowDurationInSeconds) !== null && _1 !== void 0 ? _1 : null,
        onSlowFps: (_2 = options.onSlowFps) !== null && _2 !== void 0 ? _2 : null,
        onSlowKeyframes: (_3 = options.onSlowKeyframes) !== null && _3 !== void 0 ? _3 : null,
        onSlowNumberOfFrames: (_4 = options.onSlowNumberOfFrames) !== null && _4 !== void 0 ? _4 : null,
        onSlowVideoBitrate: (_5 = options.onSlowVideoBitrate) !== null && _5 !== void 0 ? _5 : null,
        onSlowStructure: (_6 = options.onSlowStructure) !== null && _6 !== void 0 ? _6 : null,
        onM3uStreams: (_7 = options.onM3uStreams) !== null && _7 !== void 0 ? _7 : null,
        onTracks: (_8 = options.onTracks) !== null && _8 !== void 0 ? _8 : null,
        onUnrotatedDimensions: (_9 = options.onUnrotatedDimensions) !== null && _9 !== void 0 ? _9 : null,
        onVideoCodec: (_10 = options.onVideoCodec) !== null && _10 !== void 0 ? _10 : null,
        onVideoTrack: (_11 = options.onVideoTrack) !== null && _11 !== void 0 ? _11 : null,
        progressIntervalInMs: (_12 = options.progressIntervalInMs) !== null && _12 !== void 0 ? _12 : null,
        reader: (_13 = options.reader) !== null && _13 !== void 0 ? _13 : web_1.webReader,
        controller: (_14 = options.controller) !== null && _14 !== void 0 ? _14 : undefined,
        src: options.src,
        onError: async (err) => {
            var _a, _b;
            const action = (_b = (await ((_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, err)))) !== null && _b !== void 0 ? _b : { action: 'fail' };
            if (action.action === 'fail') {
                log_1.Log.verbose(logLevel, 'Removing content');
                await content.finish();
                await content.remove();
            }
            return action;
        },
        acknowledgeRemotionLicense: Boolean(options.acknowledgeRemotionLicense),
        apiName: 'parseAndDownloadMedia()',
        makeSamplesStartAtZero: (_15 = options.makeSamplesStartAtZero) !== null && _15 !== void 0 ? _15 : true,
        seekingHints: (_16 = options.seekingHints) !== null && _16 !== void 0 ? _16 : null,
    });
    await content.finish();
    return returnValue;
};
exports.downloadAndParseMedia = downloadAndParseMedia;
