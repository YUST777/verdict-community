"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAacPacket = void 0;
const aac_codecprivate_1 = require("../../aac-codecprivate");
const convert_audio_or_video_sample_1 = require("../../convert-audio-or-video-sample");
const register_track_1 = require("../../register-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const adts_header_1 = require("./adts-header");
const handle_avc_packet_1 = require("./handle-avc-packet");
const handleAacPacket = async ({ streamBuffer, programId, offset, sampleCallbacks, logLevel, onAudioTrack, transportStream, makeSamplesStartAtZero, }) => {
    var _a, _b;
    const adtsHeader = (0, adts_header_1.readAdtsHeader)(streamBuffer.getBuffer());
    if (!adtsHeader) {
        throw new Error('Invalid ADTS header - too short');
    }
    const { channelConfiguration, codecPrivate, sampleRate, audioObjectType } = adtsHeader;
    const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
        return t.trackId === programId;
    });
    if (!isTrackRegistered) {
        const startOffset = makeSamplesStartAtZero
            ? Math.min(streamBuffer.pesHeader.pts, (_a = streamBuffer.pesHeader.dts) !== null && _a !== void 0 ? _a : Infinity)
            : 0;
        transportStream.startOffset.setOffset({
            trackId: programId,
            newOffset: startOffset,
        });
        const track = {
            type: 'audio',
            codecData: { type: 'aac-config', data: codecPrivate },
            trackId: programId,
            originalTimescale: handle_avc_packet_1.MPEG_TIMESCALE,
            codecEnum: 'aac',
            codec: (0, aac_codecprivate_1.mapAudioObjectTypeToCodecString)(audioObjectType),
            // https://www.w3.org/TR/webcodecs-aac-codec-registration/
            // WebCodecs spec says that description should be given for AAC format
            // ChatGPT says that Transport Streams are always AAC, not ADTS
            description: codecPrivate,
            numberOfChannels: channelConfiguration,
            sampleRate,
            startInSeconds: 0,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackMediaTimeOffsetInTrackTimescale: 0,
        };
        await (0, register_track_1.registerAudioTrack)({
            track,
            container: 'transport-stream',
            registerAudioSampleCallback: sampleCallbacks.registerAudioSampleCallback,
            tracks: sampleCallbacks.tracks,
            logLevel,
            onAudioTrack,
        });
    }
    const sample = {
        decodingTimestamp: ((_b = streamBuffer.pesHeader.dts) !== null && _b !== void 0 ? _b : streamBuffer.pesHeader.pts) -
            transportStream.startOffset.getOffset(programId),
        timestamp: streamBuffer.pesHeader.pts -
            transportStream.startOffset.getOffset(programId),
        duration: undefined,
        data: streamBuffer.getBuffer(),
        type: 'key',
        offset,
    };
    const audioSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
        sample,
        timescale: handle_avc_packet_1.MPEG_TIMESCALE,
    });
    await sampleCallbacks.onAudioSample({
        audioSample,
        trackId: programId,
    });
    transportStream.lastEmittedSample.setLastEmittedSample(sample);
};
exports.handleAacPacket = handleAacPacket;
