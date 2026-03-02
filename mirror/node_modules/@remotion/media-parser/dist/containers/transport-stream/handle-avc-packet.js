"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAvcPacket = exports.MPEG_TIMESCALE = void 0;
const convert_audio_or_video_sample_1 = require("../../convert-audio-or-video-sample");
const register_track_1 = require("../../register-track");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const codec_string_1 = require("../avc/codec-string");
const create_sps_pps_data_1 = require("../avc/create-sps-pps-data");
const interpret_sps_1 = require("../avc/interpret-sps");
const key_1 = require("../avc/key");
const parse_avc_1 = require("../avc/parse-avc");
const sps_and_pps_1 = require("../avc/sps-and-pps");
const color_to_webcodecs_colors_1 = require("../iso-base-media/color-to-webcodecs-colors");
exports.MPEG_TIMESCALE = 90000;
const handleAvcPacket = async ({ streamBuffer, programId, offset, sampleCallbacks, logLevel, onVideoTrack, transportStream, makeSamplesStartAtZero, avcState, }) => {
    var _a, _b;
    const avc = (0, parse_avc_1.parseAvc)(streamBuffer.getBuffer(), avcState);
    const isTrackRegistered = sampleCallbacks.tracks.getTracks().find((t) => {
        return t.trackId === programId;
    });
    if (!isTrackRegistered) {
        const spsAndPps = (0, sps_and_pps_1.getSpsAndPps)(avc);
        const dimensions = (0, interpret_sps_1.getDimensionsFromSps)(spsAndPps.sps.spsData);
        const sampleAspectRatio = (0, interpret_sps_1.getSampleAspectRatioFromSps)(spsAndPps.sps.spsData);
        const startOffset = makeSamplesStartAtZero
            ? Math.min(streamBuffer.pesHeader.pts, (_a = streamBuffer.pesHeader.dts) !== null && _a !== void 0 ? _a : Infinity)
            : 0;
        transportStream.startOffset.setOffset({
            trackId: programId,
            newOffset: startOffset,
        });
        const codecPrivate = (0, create_sps_pps_data_1.createSpsPpsData)(spsAndPps);
        const advancedColor = (0, interpret_sps_1.getVideoColorFromSps)(spsAndPps.sps.spsData);
        const track = {
            m3uStreamFormat: null,
            rotation: 0,
            trackId: programId,
            type: 'video',
            originalTimescale: exports.MPEG_TIMESCALE,
            codec: (0, codec_string_1.getCodecStringFromSpsAndPps)(spsAndPps.sps),
            codecData: { type: 'avc-sps-pps', data: codecPrivate },
            fps: null,
            codedWidth: dimensions.width,
            codedHeight: dimensions.height,
            height: dimensions.height,
            width: dimensions.width,
            displayAspectWidth: dimensions.width,
            displayAspectHeight: dimensions.height,
            codecEnum: 'h264',
            // ChatGPT: In a transport stream (⁠.ts), H.264 video is always stored in Annex B format
            // WebCodecs spec says that description must be undefined for Annex B format
            // https://www.w3.org/TR/webcodecs-avc-codec-registration/#videodecoderconfig-description
            description: undefined,
            sampleAspectRatio: {
                denominator: sampleAspectRatio.height,
                numerator: sampleAspectRatio.width,
            },
            colorSpace: (0, color_to_webcodecs_colors_1.mediaParserAdvancedColorToWebCodecsColor)(advancedColor),
            advancedColor,
            startInSeconds: 0,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackMediaTimeOffsetInTrackTimescale: 0,
        };
        await (0, register_track_1.registerVideoTrack)({
            track,
            container: 'transport-stream',
            logLevel,
            onVideoTrack,
            registerVideoSampleCallback: sampleCallbacks.registerVideoSampleCallback,
            tracks: sampleCallbacks.tracks,
        });
    }
    const type = (0, key_1.getKeyFrameOrDeltaFromAvcInfo)(avc);
    // sample for webcodecs needs to be in nano seconds
    const sample = {
        decodingTimestamp: ((_b = streamBuffer.pesHeader.dts) !== null && _b !== void 0 ? _b : streamBuffer.pesHeader.pts) -
            transportStream.startOffset.getOffset(programId),
        timestamp: streamBuffer.pesHeader.pts -
            transportStream.startOffset.getOffset(programId),
        duration: undefined,
        data: streamBuffer.getBuffer(),
        type: type === 'bidirectional' ? 'delta' : type,
        offset,
    };
    if (type === 'key') {
        transportStream.observedPesHeaders.markPtsAsKeyframe(streamBuffer.pesHeader.pts);
    }
    const videoSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
        sample,
        timescale: exports.MPEG_TIMESCALE,
    });
    await sampleCallbacks.onVideoSample({
        videoSample,
        trackId: programId,
    });
    transportStream.lastEmittedSample.setLastEmittedSample(sample);
};
exports.handleAvcPacket = handleAvcPacket;
