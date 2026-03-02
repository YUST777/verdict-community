"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitAvailableInfo = void 0;
const get_streams_1 = require("./containers/m3u/get-streams");
const get_audio_codec_1 = require("./get-audio-codec");
const get_container_1 = require("./get-container");
const get_dimensions_1 = require("./get-dimensions");
const get_duration_1 = require("./get-duration");
const get_fps_1 = require("./get-fps");
const get_is_hdr_1 = require("./get-is-hdr");
const get_keyframes_1 = require("./get-keyframes");
const get_location_1 = require("./get-location");
const get_number_of_audio_channels_1 = require("./get-number-of-audio-channels");
const get_sample_rate_1 = require("./get-sample-rate");
const get_tracks_1 = require("./get-tracks");
const get_video_codec_1 = require("./get-video-codec");
const get_metadata_1 = require("./metadata/get-metadata");
const work_on_seek_request_1 = require("./work-on-seek-request");
const emitAvailableInfo = async ({ hasInfo, state, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
    const keys = Object.keys(hasInfo);
    const { emittedFields, fieldsInReturnValue, returnValue, name, callbackFunctions, } = state;
    for (const key of keys) {
        await (0, work_on_seek_request_1.workOnSeekRequest)((0, work_on_seek_request_1.getWorkOnSeekRequestOptions)(state));
        if (key === 'slowStructure') {
            if (hasInfo.slowStructure && !emittedFields.slowStructure) {
                await ((_a = callbackFunctions.onSlowStructure) === null || _a === void 0 ? void 0 : _a.call(callbackFunctions, state.structure.getStructure()));
                if (fieldsInReturnValue.slowStructure) {
                    returnValue.slowStructure = state.structure.getStructure();
                }
                emittedFields.slowStructure = true;
            }
            continue;
        }
        if (key === 'durationInSeconds') {
            if (hasInfo.durationInSeconds) {
                if (!emittedFields.durationInSeconds) {
                    const durationInSeconds = (0, get_duration_1.getDuration)(state);
                    await ((_b = callbackFunctions.onDurationInSeconds) === null || _b === void 0 ? void 0 : _b.call(callbackFunctions, durationInSeconds));
                    if (fieldsInReturnValue.durationInSeconds) {
                        returnValue.durationInSeconds = durationInSeconds;
                    }
                    emittedFields.durationInSeconds = true;
                }
            }
            continue;
        }
        if (key === 'slowDurationInSeconds') {
            if (hasInfo.slowDurationInSeconds &&
                !emittedFields.slowDurationInSeconds) {
                const slowDurationInSeconds = (_c = (0, get_duration_1.getDuration)(state)) !== null && _c !== void 0 ? _c : state.samplesObserved.getSlowDurationInSeconds();
                await ((_d = callbackFunctions.onSlowDurationInSeconds) === null || _d === void 0 ? void 0 : _d.call(callbackFunctions, slowDurationInSeconds));
                if (fieldsInReturnValue.slowDurationInSeconds) {
                    returnValue.slowDurationInSeconds = slowDurationInSeconds;
                }
                emittedFields.slowDurationInSeconds = true;
            }
            continue;
        }
        if (key === 'fps') {
            if (hasInfo.fps) {
                if (!emittedFields.fps) {
                    const fps = (0, get_fps_1.getFps)(state);
                    await ((_e = callbackFunctions.onFps) === null || _e === void 0 ? void 0 : _e.call(callbackFunctions, fps));
                    if (fieldsInReturnValue.fps) {
                        returnValue.fps = fps;
                    }
                    emittedFields.fps = true;
                }
                if (!emittedFields.slowFps) {
                    const fps = (0, get_fps_1.getFps)(state);
                    if (fps) {
                        await ((_f = callbackFunctions.onSlowFps) === null || _f === void 0 ? void 0 : _f.call(callbackFunctions, fps));
                        if (fieldsInReturnValue.slowFps) {
                            returnValue.slowFps = fps;
                        }
                        emittedFields.slowFps = true;
                    }
                }
            }
            continue;
        }
        // must be handled after fps
        if (key === 'slowFps') {
            if (hasInfo.slowFps && !emittedFields.slowFps) {
                const slowFps = (_g = (0, get_fps_1.getFps)(state)) !== null && _g !== void 0 ? _g : state.samplesObserved.getFps();
                await ((_h = callbackFunctions.onSlowFps) === null || _h === void 0 ? void 0 : _h.call(callbackFunctions, slowFps));
                if (fieldsInReturnValue.slowFps) {
                    returnValue.slowFps = slowFps;
                }
                emittedFields.slowFps = true;
            }
            continue;
        }
        if (key === 'dimensions') {
            if (hasInfo.dimensions && !emittedFields.dimensions) {
                const dimensionsQueried = (0, get_dimensions_1.getDimensions)(state);
                const dimensions = dimensionsQueried === null
                    ? null
                    : {
                        height: dimensionsQueried.height,
                        width: dimensionsQueried.width,
                    };
                await ((_j = callbackFunctions.onDimensions) === null || _j === void 0 ? void 0 : _j.call(callbackFunctions, dimensions));
                if (fieldsInReturnValue.dimensions) {
                    returnValue.dimensions = dimensions;
                }
                emittedFields.dimensions = true;
            }
            continue;
        }
        if (key === 'unrotatedDimensions') {
            if (hasInfo.unrotatedDimensions && !emittedFields.unrotatedDimensions) {
                const dimensionsQueried = (0, get_dimensions_1.getDimensions)(state);
                const unrotatedDimensions = dimensionsQueried === null
                    ? null
                    : {
                        height: dimensionsQueried.unrotatedHeight,
                        width: dimensionsQueried.unrotatedWidth,
                    };
                await ((_k = callbackFunctions.onUnrotatedDimensions) === null || _k === void 0 ? void 0 : _k.call(callbackFunctions, unrotatedDimensions));
                if (fieldsInReturnValue.unrotatedDimensions) {
                    returnValue.unrotatedDimensions = unrotatedDimensions;
                }
                emittedFields.unrotatedDimensions = true;
            }
            continue;
        }
        if (key === 'rotation') {
            if (hasInfo.rotation && !emittedFields.rotation) {
                const dimensionsQueried = (0, get_dimensions_1.getDimensions)(state);
                const rotation = (_l = dimensionsQueried === null || dimensionsQueried === void 0 ? void 0 : dimensionsQueried.rotation) !== null && _l !== void 0 ? _l : 0;
                await ((_m = callbackFunctions.onRotation) === null || _m === void 0 ? void 0 : _m.call(callbackFunctions, rotation));
                if (fieldsInReturnValue.rotation) {
                    returnValue.rotation = rotation;
                }
                emittedFields.rotation = true;
            }
            continue;
        }
        if (key === 'videoCodec') {
            if (!emittedFields.videoCodec && hasInfo.videoCodec) {
                const videoCodec = (0, get_video_codec_1.getVideoCodec)(state);
                await ((_o = callbackFunctions.onVideoCodec) === null || _o === void 0 ? void 0 : _o.call(callbackFunctions, videoCodec));
                if (fieldsInReturnValue.videoCodec) {
                    returnValue.videoCodec = videoCodec;
                }
                emittedFields.videoCodec = true;
            }
            continue;
        }
        if (key === 'audioCodec') {
            if (!emittedFields.audioCodec && hasInfo.audioCodec) {
                const audioCodec = (0, get_audio_codec_1.getAudioCodec)(state);
                await ((_p = callbackFunctions.onAudioCodec) === null || _p === void 0 ? void 0 : _p.call(callbackFunctions, audioCodec));
                if (fieldsInReturnValue.audioCodec) {
                    returnValue.audioCodec = audioCodec;
                }
                emittedFields.audioCodec = true;
            }
            continue;
        }
        if (key === 'tracks') {
            if (!emittedFields.tracks && hasInfo.tracks) {
                const tracks = (0, get_tracks_1.getTracks)(state, true);
                await ((_q = callbackFunctions.onTracks) === null || _q === void 0 ? void 0 : _q.call(callbackFunctions, tracks));
                if (fieldsInReturnValue.tracks) {
                    returnValue.tracks = tracks;
                }
                emittedFields.tracks = true;
            }
            continue;
        }
        if (key === 'internalStats') {
            // Special case: Always emitting internal stats at the end
            if (hasInfo.internalStats) {
                const internalStats = state.getInternalStats();
                if (fieldsInReturnValue.internalStats) {
                    returnValue.internalStats = internalStats;
                }
                emittedFields.internalStats = true;
            }
            continue;
        }
        if (key === 'size') {
            if (!emittedFields.size && hasInfo.size) {
                await ((_r = callbackFunctions.onSize) === null || _r === void 0 ? void 0 : _r.call(callbackFunctions, state.contentLength));
                if (fieldsInReturnValue.size) {
                    returnValue.size = state.contentLength;
                }
                emittedFields.size = true;
            }
            continue;
        }
        if (key === 'mimeType') {
            if (!emittedFields.mimeType && hasInfo.mimeType) {
                await ((_s = callbackFunctions.onMimeType) === null || _s === void 0 ? void 0 : _s.call(callbackFunctions, state.mimeType));
                if (fieldsInReturnValue.mimeType) {
                    returnValue.mimeType = state.mimeType;
                }
                emittedFields.mimeType = true;
            }
            continue;
        }
        if (key === 'name') {
            if (!emittedFields.name && hasInfo.name) {
                await ((_t = callbackFunctions.onName) === null || _t === void 0 ? void 0 : _t.call(callbackFunctions, name));
                if (fieldsInReturnValue.name) {
                    returnValue.name = name;
                }
                emittedFields.name = true;
            }
            continue;
        }
        if (key === 'isHdr') {
            if (!returnValue.isHdr && hasInfo.isHdr) {
                const isHdr = (0, get_is_hdr_1.getIsHdr)(state);
                await ((_u = callbackFunctions.onIsHdr) === null || _u === void 0 ? void 0 : _u.call(callbackFunctions, isHdr));
                if (fieldsInReturnValue.isHdr) {
                    returnValue.isHdr = isHdr;
                }
                emittedFields.isHdr = true;
            }
            continue;
        }
        if (key === 'container') {
            if (!returnValue.container && hasInfo.container) {
                const container = (0, get_container_1.getContainer)(state.structure.getStructure());
                await ((_v = callbackFunctions.onContainer) === null || _v === void 0 ? void 0 : _v.call(callbackFunctions, container));
                if (fieldsInReturnValue.container) {
                    returnValue.container = container;
                }
                emittedFields.container = true;
            }
            continue;
        }
        if (key === 'metadata') {
            if (!emittedFields.metadata && hasInfo.metadata) {
                const metadata = (0, get_metadata_1.getMetadata)(state);
                await ((_w = callbackFunctions.onMetadata) === null || _w === void 0 ? void 0 : _w.call(callbackFunctions, metadata));
                if (fieldsInReturnValue.metadata) {
                    returnValue.metadata = metadata;
                }
                emittedFields.metadata = true;
            }
            continue;
        }
        if (key === 'location') {
            if (!emittedFields.location && hasInfo.location) {
                const location = (0, get_location_1.getLocation)(state);
                await ((_x = callbackFunctions.onLocation) === null || _x === void 0 ? void 0 : _x.call(callbackFunctions, location));
                if (fieldsInReturnValue.location) {
                    returnValue.location = location;
                }
                emittedFields.location = true;
            }
            continue;
        }
        if (key === 'slowKeyframes') {
            if (!emittedFields.slowKeyframes && hasInfo.slowKeyframes) {
                await ((_y = callbackFunctions.onSlowKeyframes) === null || _y === void 0 ? void 0 : _y.call(callbackFunctions, state.keyframes.getKeyframes()));
                if (fieldsInReturnValue.slowKeyframes) {
                    returnValue.slowKeyframes = state.keyframes.getKeyframes();
                }
                emittedFields.slowKeyframes = true;
            }
            continue;
        }
        if (key === 'slowNumberOfFrames') {
            if (!emittedFields.slowNumberOfFrames && hasInfo.slowNumberOfFrames) {
                await ((_z = callbackFunctions.onSlowNumberOfFrames) === null || _z === void 0 ? void 0 : _z.call(callbackFunctions, state.samplesObserved.getSlowNumberOfFrames()));
                if (fieldsInReturnValue.slowNumberOfFrames) {
                    returnValue.slowNumberOfFrames =
                        state.samplesObserved.getSlowNumberOfFrames();
                }
                emittedFields.slowNumberOfFrames = true;
            }
            continue;
        }
        if (key === 'slowAudioBitrate') {
            if (!emittedFields.slowAudioBitrate && hasInfo.slowAudioBitrate) {
                await ((_0 = callbackFunctions.onSlowAudioBitrate) === null || _0 === void 0 ? void 0 : _0.call(callbackFunctions, state.samplesObserved.getAudioBitrate()));
                if (fieldsInReturnValue.slowAudioBitrate) {
                    returnValue.slowAudioBitrate =
                        state.samplesObserved.getAudioBitrate();
                }
                emittedFields.slowAudioBitrate = true;
            }
            continue;
        }
        if (key === 'slowVideoBitrate') {
            if (!emittedFields.slowVideoBitrate && hasInfo.slowVideoBitrate) {
                await ((_1 = callbackFunctions.onSlowVideoBitrate) === null || _1 === void 0 ? void 0 : _1.call(callbackFunctions, state.samplesObserved.getVideoBitrate()));
                if (fieldsInReturnValue.slowVideoBitrate) {
                    returnValue.slowVideoBitrate =
                        state.samplesObserved.getVideoBitrate();
                }
                emittedFields.slowVideoBitrate = true;
            }
            continue;
        }
        if (key === 'keyframes') {
            if (!emittedFields.keyframes && hasInfo.keyframes) {
                await ((_2 = callbackFunctions.onKeyframes) === null || _2 === void 0 ? void 0 : _2.call(callbackFunctions, (0, get_keyframes_1.getKeyframes)(state)));
                if (fieldsInReturnValue.keyframes) {
                    returnValue.keyframes = (0, get_keyframes_1.getKeyframes)(state);
                }
                emittedFields.keyframes = true;
            }
            continue;
        }
        if (key === 'images') {
            if (!emittedFields.images && hasInfo.images) {
                await ((_3 = callbackFunctions.onImages) === null || _3 === void 0 ? void 0 : _3.call(callbackFunctions, state.images.images));
                if (fieldsInReturnValue.images) {
                    returnValue.images = state.images.images;
                }
                emittedFields.images = true;
            }
            continue;
        }
        if (key === 'sampleRate') {
            if (!emittedFields.sampleRate && hasInfo.sampleRate) {
                const sampleRate = (0, get_sample_rate_1.getSampleRate)(state);
                await ((_4 = callbackFunctions.onSampleRate) === null || _4 === void 0 ? void 0 : _4.call(callbackFunctions, sampleRate));
                if (fieldsInReturnValue.sampleRate) {
                    returnValue.sampleRate = sampleRate;
                }
                emittedFields.sampleRate = true;
            }
            continue;
        }
        if (key === 'numberOfAudioChannels') {
            if (!emittedFields.numberOfAudioChannels &&
                hasInfo.numberOfAudioChannels) {
                const numberOfAudioChannels = (0, get_number_of_audio_channels_1.getNumberOfAudioChannels)(state);
                await ((_5 = callbackFunctions.onNumberOfAudioChannels) === null || _5 === void 0 ? void 0 : _5.call(callbackFunctions, numberOfAudioChannels));
                if (fieldsInReturnValue.numberOfAudioChannels) {
                    returnValue.numberOfAudioChannels = numberOfAudioChannels;
                }
                emittedFields.numberOfAudioChannels = true;
            }
            continue;
        }
        if (key === 'm3uStreams') {
            if (!emittedFields.m3uStreams && hasInfo.m3uStreams) {
                const streams = (0, get_streams_1.getM3uStreams)({
                    structure: state.structure.getStructureOrNull(),
                    originalSrc: state.src,
                    readerInterface: state.readerInterface,
                });
                await ((_6 = callbackFunctions.onM3uStreams) === null || _6 === void 0 ? void 0 : _6.call(callbackFunctions, streams));
                if (fieldsInReturnValue.m3uStreams) {
                    returnValue.m3uStreams = streams;
                }
                emittedFields.m3uStreams = true;
            }
            continue;
        }
        throw new Error(`Unhandled key: ${key}`);
    }
    await (0, work_on_seek_request_1.workOnSeekRequest)((0, work_on_seek_request_1.getWorkOnSeekRequestOptions)(state));
};
exports.emitAvailableInfo = emitAvailableInfo;
