"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBaseMediaTrack = void 0;
const get_audio_codec_1 = require("../../get-audio-codec");
const get_fps_1 = require("../../get-fps");
const get_sample_aspect_ratio_1 = require("../../get-sample-aspect-ratio");
const get_video_codec_1 = require("../../get-video-codec");
const normalize_video_rotation_1 = require("../../normalize-video-rotation");
const webcodecs_timescale_1 = require("../../webcodecs-timescale");
const color_to_webcodecs_colors_1 = require("./color-to-webcodecs-colors");
const get_actual_number_of_channels_1 = require("./get-actual-number-of-channels");
const get_video_codec_from_iso_track_1 = require("./get-video-codec-from-iso-track");
const get_editlist_1 = require("./mdat/get-editlist");
const traversal_1 = require("./traversal");
const makeBaseMediaTrack = (trakBox, startTimeInSeconds) => {
    var _a, _b, _c, _d, _e;
    const tkhdBox = (0, traversal_1.getTkhdBox)(trakBox);
    const videoDescriptors = (0, traversal_1.getVideoDescriptors)(trakBox);
    const timescaleAndDuration = (0, get_fps_1.getTimescaleAndDuration)(trakBox);
    if (!tkhdBox) {
        throw new Error('Expected tkhd box in trak box');
    }
    if (!timescaleAndDuration) {
        throw new Error('Expected timescale and duration in trak box');
    }
    if ((0, get_fps_1.trakBoxContainsAudio)(trakBox)) {
        const numberOfChannels = (0, get_audio_codec_1.getNumberOfChannelsFromTrak)(trakBox);
        if (numberOfChannels === null) {
            throw new Error('Could not find number of channels');
        }
        const sampleRate = (0, get_audio_codec_1.getSampleRate)(trakBox);
        if (sampleRate === null) {
            throw new Error('Could not find sample rate');
        }
        const { codecString, description } = (0, get_audio_codec_1.getAudioCodecStringFromTrak)(trakBox);
        const codecPrivate = (_b = (_a = (0, get_audio_codec_1.getCodecPrivateFromTrak)(trakBox)) !== null && _a !== void 0 ? _a : description) !== null && _b !== void 0 ? _b : null;
        const codecEnum = (0, get_audio_codec_1.getAudioCodecFromTrack)(trakBox);
        const actual = (0, get_actual_number_of_channels_1.getActualDecoderParameters)({
            audioCodec: codecEnum,
            codecPrivate: codecPrivate !== null && codecPrivate !== void 0 ? codecPrivate : null,
            numberOfChannels,
            sampleRate,
        });
        return {
            type: 'audio',
            trackId: tkhdBox.trackId,
            originalTimescale: timescaleAndDuration.timescale,
            codec: codecString,
            numberOfChannels: actual.numberOfChannels,
            sampleRate: actual.sampleRate,
            description: (_d = (_c = actual.codecPrivate) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : undefined,
            codecData: actual.codecPrivate,
            codecEnum,
            startInSeconds: startTimeInSeconds,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackMediaTimeOffsetInTrackTimescale: (0, get_editlist_1.findTrackMediaTimeOffsetInTrackTimescale)({
                trakBox,
            }),
        };
    }
    if (!(0, get_fps_1.trakBoxContainsVideo)(trakBox)) {
        return {
            type: 'other',
            trackId: tkhdBox.trackId,
            originalTimescale: timescaleAndDuration.timescale,
            trakBox,
            startInSeconds: startTimeInSeconds,
            timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
            trackMediaTimeOffsetInTrackTimescale: (0, get_editlist_1.findTrackMediaTimeOffsetInTrackTimescale)({
                trakBox,
            }),
        };
    }
    const videoSample = (0, get_sample_aspect_ratio_1.getStsdVideoConfig)(trakBox);
    if (!videoSample) {
        throw new Error('No video sample');
    }
    const sampleAspectRatio = (0, get_sample_aspect_ratio_1.getSampleAspectRatio)(trakBox);
    const aspectRatioApplied = (0, get_sample_aspect_ratio_1.applyAspectRatios)({
        dimensions: videoSample,
        sampleAspectRatio,
        displayAspectRatio: (0, get_sample_aspect_ratio_1.getDisplayAspectRatio)({
            sampleAspectRatio,
            nativeDimensions: videoSample,
        }),
    });
    const { displayAspectHeight, displayAspectWidth, height, rotation, width } = (0, get_sample_aspect_ratio_1.applyTkhdBox)(aspectRatioApplied, tkhdBox);
    const codec = (0, get_video_codec_1.getVideoCodecString)(trakBox);
    if (!codec) {
        throw new Error('Could not find video codec');
    }
    const privateData = (0, get_video_codec_1.getVideoPrivateData)(trakBox);
    const advancedColor = (_e = (0, get_video_codec_1.getIsoBmColrConfig)(trakBox)) !== null && _e !== void 0 ? _e : {
        fullRange: null,
        matrix: null,
        primaries: null,
        transfer: null,
    };
    const track = {
        m3uStreamFormat: null,
        type: 'video',
        trackId: tkhdBox.trackId,
        description: videoDescriptors !== null && videoDescriptors !== void 0 ? videoDescriptors : undefined,
        originalTimescale: timescaleAndDuration.timescale,
        codec,
        sampleAspectRatio: (0, get_sample_aspect_ratio_1.getSampleAspectRatio)(trakBox),
        width,
        height,
        codedWidth: videoSample.width,
        codedHeight: videoSample.height,
        // Repeating those keys because they get picked up by VideoDecoder
        displayAspectWidth,
        displayAspectHeight,
        rotation: (0, normalize_video_rotation_1.normalizeVideoRotation)(0 - rotation),
        codecData: privateData,
        colorSpace: (0, color_to_webcodecs_colors_1.mediaParserAdvancedColorToWebCodecsColor)(advancedColor),
        advancedColor,
        codecEnum: (0, get_video_codec_from_iso_track_1.getVideoCodecFromIsoTrak)(trakBox),
        fps: (0, get_fps_1.getFpsFromMp4TrakBox)(trakBox),
        startInSeconds: startTimeInSeconds,
        timescale: webcodecs_timescale_1.WEBCODECS_TIMESCALE,
        trackMediaTimeOffsetInTrackTimescale: (0, get_editlist_1.findTrackMediaTimeOffsetInTrackTimescale)({
            trakBox,
        }),
    };
    return track;
};
exports.makeBaseMediaTrack = makeBaseMediaTrack;
