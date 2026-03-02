"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStreamInfo = void 0;
const register_track_1 = require("../../register-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const parseStreamInfo = async ({ iterator, state, }) => {
    const counter = iterator.counter.getOffset();
    const minimumBlockSize = iterator.getUint16();
    const maximumBlockSize = iterator.getUint16();
    const minimumFrameSize = iterator.getUint24();
    const maximumFrameSize = iterator.getUint24();
    iterator.startReadingBits();
    const sampleRate = iterator.getBits(20);
    const channels = iterator.getBits(3) + 1;
    const bitsPerSample = iterator.getBits(5);
    const totalSamples = iterator.getBits(36);
    iterator.getBits(128); // md5
    iterator.stopReadingBits();
    const counterNow = iterator.counter.getOffset();
    const size = counterNow - counter;
    iterator.counter.decrement(size);
    const asUint8Array = iterator.getSlice(size);
    const flacStreamInfo = {
        type: 'flac-streaminfo',
        bitsPerSample,
        channels,
        maximumBlockSize,
        maximumFrameSize,
        minimumBlockSize,
        minimumFrameSize,
        sampleRate,
        totalSamples,
    };
    state.structure.getFlacStructure().boxes.push(flacStreamInfo);
    await (0, register_track_1.registerAudioTrack)({
        container: 'flac',
        track: {
            codec: 'flac',
            type: 'audio',
            description: asUint8Array,
            codecData: { type: 'flac-description', data: asUint8Array },
            codecEnum: 'flac',
            numberOfChannels: channels,
            sampleRate,
            originalTimescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackId: 0,
            startInSeconds: 0,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackMediaTimeOffsetInTrackTimescale: 0,
        },
        registerAudioSampleCallback: state.callbacks.registerAudioSampleCallback,
        tracks: state.callbacks.tracks,
        logLevel: state.logLevel,
        onAudioTrack: state.onAudioTrack,
    });
    state.callbacks.tracks.setIsDone(state.logLevel);
    return Promise.resolve(null);
};
exports.parseStreamInfo = parseStreamInfo;
