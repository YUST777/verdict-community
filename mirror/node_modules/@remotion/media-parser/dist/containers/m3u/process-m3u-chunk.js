"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processM3uChunk = void 0;
const media_parser_controller_1 = require("../../controller/media-parser-controller");
const forward_controller_pause_resume_abort_1 = require("../../forward-controller-pause-resume-abort");
const parse_media_1 = require("../../parse-media");
const register_track_1 = require("../../register-track");
const with_resolvers_1 = require("../../with-resolvers");
const first_sample_in_m3u_chunk_1 = require("./first-sample-in-m3u-chunk");
const get_chunks_1 = require("./get-chunks");
const get_playlist_1 = require("./get-playlist");
const get_chunk_to_seek_to_1 = require("./seek/get-chunk-to-seek-to");
const processM3uChunk = ({ playlistUrl, state, structure, audioDone, videoDone, }) => {
    const { promise, reject, resolve } = (0, with_resolvers_1.withResolvers)();
    const onGlobalAudioTrack = audioDone
        ? null
        : async (track) => {
            const existingTracks = state.callbacks.tracks.getTracks();
            let { trackId } = track;
            while (existingTracks.find((t) => t.trackId === trackId)) {
                trackId++;
            }
            const onAudioSample = await (0, register_track_1.registerAudioTrack)({
                container: 'm3u8',
                track: {
                    ...track,
                    trackId,
                },
                registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
                tracks: state.callbacks.tracks,
                logLevel: state.logLevel,
                onAudioTrack: state.onAudioTrack,
            });
            state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);
            if (onAudioSample === null) {
                return null;
            }
            state.m3u.sampleSorter.addAudioStreamToConsider(playlistUrl, onAudioSample);
            return async (sample) => {
                await state.m3u.sampleSorter.addAudioSample(playlistUrl, sample);
            };
        };
    const onGlobalVideoTrack = videoDone
        ? null
        : async (track) => {
            const existingTracks = state.callbacks.tracks.getTracks();
            let { trackId } = track;
            while (existingTracks.find((t) => t.trackId === trackId)) {
                trackId++;
            }
            const onVideoSample = await (0, register_track_1.registerVideoTrack)({
                container: 'm3u8',
                track: {
                    ...track,
                    trackId,
                },
                logLevel: state.logLevel,
                onVideoTrack: state.onVideoTrack,
                registerVideoSampleCallback: state.callbacks.registerVideoSampleCallback,
                tracks: state.callbacks.tracks,
            });
            state.m3u.sampleSorter.addToStreamWithTrack(playlistUrl);
            if (onVideoSample === null) {
                return null;
            }
            state.m3u.sampleSorter.addVideoStreamToConsider(playlistUrl, onVideoSample);
            return async (sample) => {
                await state.m3u.sampleSorter.addVideoSample(playlistUrl, sample);
            };
        };
    // This function will run through the whole playlist step by step, and pause itself
    // On the next run it will continue
    const pausableIterator = async () => {
        const playlist = (0, get_playlist_1.getPlaylist)(structure, playlistUrl);
        const chunks = (0, get_chunks_1.getChunks)(playlist);
        const seekToSecondsToProcess = state.m3u.getSeekToSecondsToProcess(playlistUrl);
        const chunksToSubtract = state.m3u.getNextSeekShouldSubtractChunks(playlistUrl);
        let chunkIndex = null;
        if (seekToSecondsToProcess !== null) {
            chunkIndex = Math.max(0, (0, get_chunk_to_seek_to_1.getChunkToSeekTo)({
                chunks,
                seekToSecondsToProcess: seekToSecondsToProcess.targetTime,
            }) - chunksToSubtract);
        }
        const currentPromise = {
            resolver: (() => undefined),
            rejector: reject,
        };
        const requiresHeaderToBeFetched = chunks[0].isHeader;
        for (const chunk of chunks) {
            const mp4HeaderSegment = state.m3u.getMp4HeaderSegment(playlistUrl);
            if (requiresHeaderToBeFetched && mp4HeaderSegment && chunk.isHeader) {
                continue;
            }
            if (chunkIndex !== null &&
                chunks.indexOf(chunk) < chunkIndex &&
                !chunk.isHeader) {
                continue;
            }
            currentPromise.resolver = (newRun) => {
                state.m3u.setM3uStreamRun(playlistUrl, newRun);
                resolve();
            };
            currentPromise.rejector = reject;
            const childController = (0, media_parser_controller_1.mediaParserController)();
            const forwarded = (0, forward_controller_pause_resume_abort_1.forwardMediaParserControllerPauseResume)({
                childController,
                parentController: state.controller,
            });
            const nextChunk = chunks[chunks.indexOf(chunk) + 1];
            if (nextChunk) {
                const nextChunkSource = state.readerInterface.createAdjacentFileSource(nextChunk.url, playlistUrl);
                state.readerInterface.preload({
                    logLevel: state.logLevel,
                    range: null,
                    src: nextChunkSource,
                    prefetchCache: state.prefetchCache,
                });
            }
            const makeContinuationFn = () => {
                return {
                    continue() {
                        const resolver = (0, with_resolvers_1.withResolvers)();
                        currentPromise.resolver = resolver.resolve;
                        currentPromise.rejector = resolver.reject;
                        childController.resume();
                        return resolver.promise;
                    },
                    abort() {
                        childController.abort();
                    },
                };
            };
            const isLastChunk = chunk === chunks[chunks.length - 1];
            await childController._internals.checkForAbortAndPause();
            const src = state.readerInterface.createAdjacentFileSource(chunk.url, playlistUrl);
            try {
                const data = await (0, parse_media_1.parseMedia)({
                    src,
                    acknowledgeRemotionLicense: true,
                    logLevel: state.logLevel,
                    controller: childController,
                    progressIntervalInMs: 0,
                    onParseProgress: () => {
                        childController.pause();
                        currentPromise.resolver(makeContinuationFn());
                    },
                    fields: chunk.isHeader ? { slowStructure: true } : undefined,
                    onTracks: () => {
                        if (!state.m3u.hasEmittedDoneWithTracks(playlistUrl)) {
                            state.m3u.setHasEmittedDoneWithTracks(playlistUrl);
                            const allDone = state.m3u.setTracksDone(playlistUrl);
                            if (allDone) {
                                state.callbacks.tracks.setIsDone(state.logLevel);
                            }
                            return null;
                        }
                    },
                    onAudioTrack: onGlobalAudioTrack === null
                        ? null
                        : async ({ track }) => {
                            const callbackOrFalse = state.m3u.hasEmittedAudioTrack(playlistUrl);
                            if (callbackOrFalse === false) {
                                const callback = await onGlobalAudioTrack(track);
                                if (!callback) {
                                    state.m3u.setHasEmittedAudioTrack(playlistUrl, null);
                                    return null;
                                }
                                state.m3u.setHasEmittedAudioTrack(playlistUrl, callback);
                                return async (sample) => {
                                    await (0, first_sample_in_m3u_chunk_1.considerSeekBasedOnChunk)({
                                        sample,
                                        callback,
                                        parentController: state.controller,
                                        childController,
                                        m3uState: state.m3u,
                                        playlistUrl,
                                        subtractChunks: chunksToSubtract,
                                        chunkIndex,
                                    });
                                };
                            }
                            if (callbackOrFalse === null) {
                                return null;
                            }
                            return async (sample) => {
                                await (0, first_sample_in_m3u_chunk_1.considerSeekBasedOnChunk)({
                                    sample,
                                    m3uState: state.m3u,
                                    playlistUrl,
                                    callback: callbackOrFalse,
                                    parentController: state.controller,
                                    childController,
                                    subtractChunks: chunksToSubtract,
                                    chunkIndex,
                                });
                            };
                        },
                    onVideoTrack: onGlobalVideoTrack === null
                        ? null
                        : async ({ track }) => {
                            const callbackOrFalse = state.m3u.hasEmittedVideoTrack(playlistUrl);
                            if (callbackOrFalse === false) {
                                const callback = await onGlobalVideoTrack({
                                    ...track,
                                    m3uStreamFormat: chunk.isHeader || mp4HeaderSegment ? 'mp4' : 'ts',
                                });
                                if (!callback) {
                                    state.m3u.setHasEmittedVideoTrack(playlistUrl, null);
                                    return null;
                                }
                                state.m3u.setHasEmittedVideoTrack(playlistUrl, callback);
                                return async (sample) => {
                                    await (0, first_sample_in_m3u_chunk_1.considerSeekBasedOnChunk)({
                                        sample,
                                        m3uState: state.m3u,
                                        playlistUrl,
                                        callback,
                                        parentController: state.controller,
                                        childController,
                                        subtractChunks: chunksToSubtract,
                                        chunkIndex,
                                    });
                                };
                            }
                            if (callbackOrFalse === null) {
                                return null;
                            }
                            return async (sample) => {
                                await (0, first_sample_in_m3u_chunk_1.considerSeekBasedOnChunk)({
                                    sample,
                                    m3uState: state.m3u,
                                    playlistUrl,
                                    callback: callbackOrFalse,
                                    parentController: state.controller,
                                    childController,
                                    subtractChunks: chunksToSubtract,
                                    chunkIndex,
                                });
                            };
                        },
                    reader: state.readerInterface,
                    makeSamplesStartAtZero: false,
                    m3uPlaylistContext: {
                        mp4HeaderSegment,
                        isLastChunkInPlaylist: isLastChunk,
                    },
                });
                if (chunk.isHeader) {
                    if (data.slowStructure.type !== 'iso-base-media') {
                        throw new Error('Expected an mp4 file');
                    }
                    state.m3u.setMp4HeaderSegment(playlistUrl, data.slowStructure);
                }
            }
            catch (e) {
                currentPromise.rejector(e);
                throw e;
            }
            forwarded.cleanup();
            if (!isLastChunk) {
                childController.pause();
                currentPromise.resolver(makeContinuationFn());
            }
        }
        currentPromise.resolver(null);
    };
    const run = pausableIterator();
    run.catch((err) => {
        reject(err);
    });
    return promise;
};
exports.processM3uChunk = processM3uChunk;
