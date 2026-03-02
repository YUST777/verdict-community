"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMediaOnWorkerImplementation = void 0;
const with_resolvers_1 = require("./with-resolvers");
const serialize_error_1 = require("./worker/serialize-error");
const convertToWorkerPayload = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
payload) => {
    const { onAudioCodec, onContainer, onDimensions, onUnrotatedDimensions, onVideoCodec, onFps, onAudioTrack, onDurationInSeconds, onImages, onInternalStats, onIsHdr, onKeyframes, onLocation, onM3uStreams, onMetadata, onMimeType, onName, onNumberOfAudioChannels, onParseProgress, onRotation, onSampleRate, onSlowAudioBitrate, onSize, onSlowDurationInSeconds, onSlowFps, onSlowKeyframes, onSlowNumberOfFrames, onSlowVideoBitrate, onSlowStructure, onTracks, onVideoTrack, selectM3uStream, selectM3uAssociatedPlaylists, src, ...others } = payload;
    return {
        type: 'request-worker',
        payload: others,
        postAudioCodec: Boolean(onAudioCodec),
        postContainer: Boolean(onContainer),
        postDimensions: Boolean(onDimensions),
        postDurationInSeconds: Boolean(onDurationInSeconds),
        postFps: Boolean(onFps),
        postImages: Boolean(onImages),
        postInternalStats: Boolean(onInternalStats),
        postIsHdr: Boolean(onIsHdr),
        postKeyframes: Boolean(onKeyframes),
        postLocation: Boolean(onLocation),
        postM3uStreams: Boolean(onM3uStreams),
        postMetadata: Boolean(onMetadata),
        postMimeType: Boolean(onMimeType),
        postName: Boolean(onName),
        postNumberOfAudioChannels: Boolean(onNumberOfAudioChannels),
        postRotation: Boolean(onRotation),
        postSampleRate: Boolean(onSampleRate),
        postSlowAudioBitrate: Boolean(onSlowAudioBitrate),
        postSlowDurationInSeconds: Boolean(onSlowDurationInSeconds),
        postSlowFps: Boolean(onSlowFps),
        postSlowKeyframes: Boolean(onSlowKeyframes),
        postSlowNumberOfFrames: Boolean(onSlowNumberOfFrames),
        postSlowVideoBitrate: Boolean(onSlowVideoBitrate),
        postSlowStructure: Boolean(onSlowStructure),
        postTracks: Boolean(onTracks),
        postUnrotatedDimensions: Boolean(onUnrotatedDimensions),
        postVideoCodec: Boolean(onVideoCodec),
        postSize: Boolean(onSize),
        postParseProgress: Boolean(onParseProgress),
        postM3uStreamSelection: Boolean(selectM3uStream),
        postM3uAssociatedPlaylistsSelection: Boolean(selectM3uAssociatedPlaylists),
        postOnAudioTrack: Boolean(onAudioTrack),
        postOnVideoTrack: Boolean(onVideoTrack),
        // URL cannot be serialized, so we convert it to a string
        src: src instanceof URL ? src.toString() : src,
    };
};
const post = (worker, payload) => {
    worker.postMessage(payload);
};
const parseMediaOnWorkerImplementation = async ({ controller, reader, ...params }, worker, apiName) => {
    if (reader) {
        throw new Error(`\`reader\` should not be provided to \`${apiName}\`. If you want to use it in the browser, use parseMediaOnWorker(). If you also want to read files from the file system, use parseMediaOnServerWorker().`);
    }
    post(worker, convertToWorkerPayload(params));
    let workerTerminated = false;
    const { promise, resolve, reject } = (0, with_resolvers_1.withResolvers)();
    const onAbort = () => {
        post(worker, { type: 'request-abort' });
    };
    const onResume = () => {
        post(worker, { type: 'request-resume' });
    };
    const onPause = () => {
        post(worker, { type: 'request-pause' });
    };
    const onSeek = ({ detail: { seek } }) => {
        post(worker, { type: 'request-seek', payload: seek });
        controller === null || controller === void 0 ? void 0 : controller._internals.seekSignal.clearSeekIfStillSame(seek);
    };
    const seekingHintPromises = [];
    let finalSeekingHints = null;
    controller === null || controller === void 0 ? void 0 : controller._internals.attachSeekingHintResolution(() => {
        if (finalSeekingHints) {
            return Promise.resolve(finalSeekingHints);
        }
        if (workerTerminated) {
            return Promise.reject(new Error('Worker terminated'));
        }
        const prom = (0, with_resolvers_1.withResolvers)();
        post(worker, { type: 'request-get-seeking-hints' });
        seekingHintPromises.push(prom);
        return prom.promise;
    });
    const simulateSeekPromises = {};
    controller === null || controller === void 0 ? void 0 : controller._internals.attachSimulateSeekResolution((seek) => {
        const prom = (0, with_resolvers_1.withResolvers)();
        const nonce = String(Math.random());
        post(worker, { type: 'request-simulate-seek', payload: seek, nonce });
        simulateSeekPromises[nonce] = prom;
        return prom.promise;
    });
    const callbacks = {};
    const trackDoneCallbacks = {};
    function onMessage(message) {
        const data = message.data;
        if (data.type === 'response-done') {
            resolve(data.payload);
            if (data.seekingHints) {
                finalSeekingHints = data.seekingHints;
                for (const prom of seekingHintPromises) {
                    prom.resolve(finalSeekingHints);
                }
            }
            return;
        }
        if (data.type === 'response-error') {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            cleanup();
            // Reject main loop
            const error = (0, serialize_error_1.deserializeError)(data);
            error.stack = data.errorStack;
            reject(error);
            // If aborted, we send the seeking hints we got,
            // otherwise we reject all .getSeekingHints() promises
            if (data.errorName === 'MediaParserAbortError') {
                finalSeekingHints = data.seekingHints;
                for (const prom of seekingHintPromises) {
                    prom.resolve(finalSeekingHints);
                }
            }
            else {
                // Reject all .getSeekingHints() promises
                for (const prom of seekingHintPromises) {
                    prom.reject(error);
                }
            }
            return;
        }
        if (data.type === 'response-on-callback-request') {
            Promise.resolve()
                .then(async () => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
                if (data.payload.callbackType === 'audio-codec') {
                    await ((_a = params.onAudioCodec) === null || _a === void 0 ? void 0 : _a.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'container') {
                    await ((_b = params.onContainer) === null || _b === void 0 ? void 0 : _b.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'dimensions') {
                    await ((_c = params.onDimensions) === null || _c === void 0 ? void 0 : _c.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'unrotated-dimensions') {
                    await ((_d = params.onUnrotatedDimensions) === null || _d === void 0 ? void 0 : _d.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'video-codec') {
                    await ((_e = params.onVideoCodec) === null || _e === void 0 ? void 0 : _e.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'tracks') {
                    await ((_f = params.onTracks) === null || _f === void 0 ? void 0 : _f.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'rotation') {
                    await ((_g = params.onRotation) === null || _g === void 0 ? void 0 : _g.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'sample-rate') {
                    await ((_h = params.onSampleRate) === null || _h === void 0 ? void 0 : _h.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-audio-bitrate') {
                    await ((_j = params.onSlowAudioBitrate) === null || _j === void 0 ? void 0 : _j.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-duration-in-seconds') {
                    await ((_k = params.onSlowDurationInSeconds) === null || _k === void 0 ? void 0 : _k.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-fps') {
                    await ((_l = params.onSlowFps) === null || _l === void 0 ? void 0 : _l.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-keyframes') {
                    await ((_m = params.onSlowKeyframes) === null || _m === void 0 ? void 0 : _m.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-number-of-frames') {
                    await ((_o = params.onSlowNumberOfFrames) === null || _o === void 0 ? void 0 : _o.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-video-bitrate') {
                    await ((_p = params.onSlowVideoBitrate) === null || _p === void 0 ? void 0 : _p.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'slow-structure') {
                    await ((_q = params.onSlowStructure) === null || _q === void 0 ? void 0 : _q.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'fps') {
                    await ((_r = params.onFps) === null || _r === void 0 ? void 0 : _r.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'images') {
                    await ((_s = params.onImages) === null || _s === void 0 ? void 0 : _s.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'internal-stats') {
                    await ((_t = params.onInternalStats) === null || _t === void 0 ? void 0 : _t.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'is-hdr') {
                    await ((_u = params.onIsHdr) === null || _u === void 0 ? void 0 : _u.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'keyframes') {
                    await ((_v = params.onKeyframes) === null || _v === void 0 ? void 0 : _v.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'location') {
                    await ((_w = params.onLocation) === null || _w === void 0 ? void 0 : _w.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'm3u-streams') {
                    await ((_x = params.onM3uStreams) === null || _x === void 0 ? void 0 : _x.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'metadata') {
                    await ((_y = params.onMetadata) === null || _y === void 0 ? void 0 : _y.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'mime-type') {
                    await ((_z = params.onMimeType) === null || _z === void 0 ? void 0 : _z.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'name') {
                    await ((_0 = params.onName) === null || _0 === void 0 ? void 0 : _0.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'number-of-audio-channels') {
                    await ((_1 = params.onNumberOfAudioChannels) === null || _1 === void 0 ? void 0 : _1.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'size') {
                    await ((_2 = params.onSize) === null || _2 === void 0 ? void 0 : _2.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'duration-in-seconds') {
                    await ((_3 = params.onDurationInSeconds) === null || _3 === void 0 ? void 0 : _3.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'parse-progress') {
                    await ((_4 = params.onParseProgress) === null || _4 === void 0 ? void 0 : _4.call(params, data.payload.value));
                    return { payloadType: 'void' };
                }
                if (data.payload.callbackType === 'm3u-stream-selection') {
                    const selection = await params.selectM3uStream(data.payload.value);
                    return { payloadType: 'm3u-stream-selection', value: selection };
                }
                if (data.payload.callbackType === 'm3u-associated-playlists-selection') {
                    const selection = await params.selectM3uAssociatedPlaylists(data.payload.value);
                    return {
                        payloadType: 'm3u-associated-playlists-selection',
                        value: selection,
                    };
                }
                if (data.payload.callbackType === 'on-audio-track') {
                    const possibleCallback = await ((_5 = params.onAudioTrack) === null || _5 === void 0 ? void 0 : _5.call(params, data.payload.value));
                    if (possibleCallback) {
                        callbacks[data.payload.value.track.trackId] = possibleCallback;
                    }
                    return {
                        payloadType: 'on-audio-track-response',
                        registeredCallback: Boolean(possibleCallback),
                    };
                }
                if (data.payload.callbackType === 'on-video-track') {
                    const possibleCallback = await ((_6 = params.onVideoTrack) === null || _6 === void 0 ? void 0 : _6.call(params, data.payload.value));
                    if (possibleCallback) {
                        callbacks[data.payload.value.track.trackId] = possibleCallback;
                    }
                    return {
                        payloadType: 'on-video-track-response',
                        registeredCallback: Boolean(possibleCallback),
                    };
                }
                if (data.payload.callbackType === 'on-audio-sample') {
                    const callback = callbacks[data.payload.trackId];
                    if (!callback) {
                        throw new Error(`No callback registered for track ${data.payload.trackId}`);
                    }
                    const trackDoneCallback = await callback(data.payload.value);
                    if (trackDoneCallback) {
                        trackDoneCallbacks[data.payload.trackId] = trackDoneCallback;
                    }
                    return {
                        payloadType: 'on-sample-response',
                        registeredTrackDoneCallback: Boolean(trackDoneCallback),
                    };
                }
                if (data.payload.callbackType === 'on-video-sample') {
                    const callback = callbacks[data.payload.trackId];
                    if (!callback) {
                        throw new Error(`No callback registered for track ${data.payload.trackId}`);
                    }
                    const trackDoneCallback = await callback(data.payload.value);
                    if (trackDoneCallback) {
                        trackDoneCallbacks[data.payload.trackId] = trackDoneCallback;
                    }
                    return {
                        payloadType: 'on-sample-response',
                        registeredTrackDoneCallback: Boolean(trackDoneCallback),
                    };
                }
                if (data.payload.callbackType === 'track-done') {
                    const trackDoneCallback = trackDoneCallbacks[data.payload.trackId];
                    if (!trackDoneCallback) {
                        throw new Error(`No track done callback registered for track ${data.payload.trackId}`);
                    }
                    trackDoneCallback();
                    return { payloadType: 'void' };
                }
                throw new Error(`Unknown callback type: ${data.payload}`);
            })
                .then((payload) => {
                post(worker, {
                    type: 'acknowledge-callback',
                    nonce: data.nonce,
                    ...payload,
                });
            })
                .catch((err) => {
                reject(err);
                post(worker, {
                    type: 'signal-error-in-callback',
                    nonce: data.nonce,
                });
            });
            return;
        }
        if (data.type === 'response-get-seeking-hints') {
            const firstPromise = seekingHintPromises.shift();
            if (!firstPromise) {
                throw new Error('No seeking hint promise found');
            }
            firstPromise.resolve(data.payload);
            return;
        }
        if (data.type === 'response-simulate-seek') {
            const prom = simulateSeekPromises[data.nonce];
            if (!prom) {
                throw new Error('No simulate seek promise found');
            }
            prom.resolve(data.payload);
            delete simulateSeekPromises[data.nonce];
            return;
        }
        throw new Error(`Unknown response type: ${JSON.stringify(data)}`);
    }
    worker.addEventListener('message', onMessage);
    controller === null || controller === void 0 ? void 0 : controller.addEventListener('abort', onAbort);
    controller === null || controller === void 0 ? void 0 : controller.addEventListener('resume', onResume);
    controller === null || controller === void 0 ? void 0 : controller.addEventListener('pause', onPause);
    controller === null || controller === void 0 ? void 0 : controller.addEventListener('seek', onSeek);
    function cleanup() {
        worker.removeEventListener('message', onMessage);
        controller === null || controller === void 0 ? void 0 : controller.removeEventListener('abort', onAbort);
        controller === null || controller === void 0 ? void 0 : controller.removeEventListener('resume', onResume);
        controller === null || controller === void 0 ? void 0 : controller.removeEventListener('pause', onPause);
        controller === null || controller === void 0 ? void 0 : controller.removeEventListener('seek', onSeek);
        workerTerminated = true;
        worker.terminate();
    }
    controller === null || controller === void 0 ? void 0 : controller._internals.markAsReadyToEmitEvents();
    const val = await promise;
    cleanup();
    return val;
};
exports.parseMediaOnWorkerImplementation = parseMediaOnWorkerImplementation;
