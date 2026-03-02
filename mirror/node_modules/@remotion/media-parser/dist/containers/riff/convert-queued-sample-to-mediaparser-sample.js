"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertQueuedSampleToMediaParserSample = void 0;
const convert_audio_or_video_sample_1 = require("../../convert-audio-or-video-sample");
const get_strh_for_index_1 = require("./get-strh-for-index");
const getKeyFrameOffsetAndPocs = ({ state, sample, trackId, }) => {
    var _a, _b;
    if (sample.type === 'key') {
        const sampleOffset = state.riff.sampleCounter.getSampleCountForTrack({
            trackId,
        });
        return {
            sampleOffsetAtKeyframe: sampleOffset,
            pocsAtKeyframeOffset: [(_b = (_a = sample.avc) === null || _a === void 0 ? void 0 : _a.poc) !== null && _b !== void 0 ? _b : 0],
        };
    }
    const riffKeyframes = state.riff.sampleCounter.riffKeys.getKeyframes();
    const keyframeAtOffset = riffKeyframes.findLast((k) => k.positionInBytes <= sample.offset);
    if (!keyframeAtOffset) {
        throw new Error('no keyframe at offset');
    }
    const sampleOffsetAtKeyframe = keyframeAtOffset.sampleCounts[trackId];
    const pocsAtKeyframeOffset = state.riff.sampleCounter.getPocAtKeyframeOffset({
        keyframeOffset: keyframeAtOffset.positionInBytes,
    });
    return {
        sampleOffsetAtKeyframe,
        pocsAtKeyframeOffset,
    };
};
const convertQueuedSampleToMediaParserSample = ({ sample, state, trackId, }) => {
    const strh = (0, get_strh_for_index_1.getStrhForIndex)(state.structure.getRiffStructure(), trackId);
    const samplesPerSecond = strh.rate / strh.scale;
    const { sampleOffsetAtKeyframe, pocsAtKeyframeOffset } = getKeyFrameOffsetAndPocs({
        sample,
        state,
        trackId,
    });
    const indexOfPoc = pocsAtKeyframeOffset.findIndex((poc) => { var _a; return poc === ((_a = sample.avc) === null || _a === void 0 ? void 0 : _a.poc); });
    if (indexOfPoc === -1) {
        throw new Error('poc not found');
    }
    const nthSample = indexOfPoc + sampleOffsetAtKeyframe;
    const timestamp = nthSample / samplesPerSecond;
    const videoSample = (0, convert_audio_or_video_sample_1.convertAudioOrVideoSampleToWebCodecsTimestamps)({
        sample: {
            ...sample,
            timestamp,
            decodingTimestamp: timestamp,
        },
        timescale: 1,
    });
    return videoSample;
};
exports.convertQueuedSampleToMediaParserSample = convertQueuedSampleToMediaParserSample;
