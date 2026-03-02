"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeekingByteFromMatroska = void 0;
const log_1 = require("../../../log");
const toSeconds = (timeInTimescale, track) => {
    return (timeInTimescale / track.timescale) * 1000;
};
const findBiggestCueBeforeTime = ({ cues, time, track, }) => {
    let biggestCueBeforeTime;
    for (const cue of cues) {
        const cueTimeInSeconds = toSeconds(cue.timeInTimescale, track);
        if (cueTimeInSeconds < time &&
            (!biggestCueBeforeTime ||
                cueTimeInSeconds >
                    toSeconds(biggestCueBeforeTime.timeInTimescale, track))) {
            biggestCueBeforeTime = cue;
        }
    }
    return biggestCueBeforeTime;
};
const findKeyframeBeforeTime = ({ keyframes, time, }) => {
    let keyframeBeforeTime;
    for (const keyframe of keyframes) {
        if (keyframe.decodingTimeInSeconds < time &&
            (!keyframeBeforeTime ||
                keyframe.decodingTimeInSeconds >
                    keyframeBeforeTime.decodingTimeInSeconds)) {
            keyframeBeforeTime = keyframe;
        }
    }
    return keyframeBeforeTime !== null && keyframeBeforeTime !== void 0 ? keyframeBeforeTime : null;
};
const getByteFromCues = ({ cuesResponse, time, info, logLevel, }) => {
    if (!cuesResponse) {
        log_1.Log.trace(logLevel, 'Has no Matroska cues at the moment, cannot use them');
        return null;
    }
    const { cues, segmentOffset } = cuesResponse;
    log_1.Log.trace(logLevel, 'Has Matroska cues. Will use them to perform a seek.');
    const biggestCueBeforeTime = findBiggestCueBeforeTime({
        cues,
        time,
        track: info.track,
    });
    if (!biggestCueBeforeTime) {
        return null;
    }
    return {
        byte: biggestCueBeforeTime.clusterPositionInSegment + segmentOffset,
        timeInSeconds: toSeconds(biggestCueBeforeTime.timeInTimescale, info.track),
    };
};
const getSeekingByteFromMatroska = async ({ time, webmState, info, logLevel, mediaSection, }) => {
    var _a, _b, _c, _d, _e;
    if (!info.track) {
        log_1.Log.trace(logLevel, 'No video track found, cannot seek yet');
        return {
            type: 'valid-but-must-wait',
        };
    }
    const cuesResponse = (_a = info.loadedCues) !== null && _a !== void 0 ? _a : (await webmState.cues.getLoadedCues());
    // Check if we have already read keyframes
    const byteFromObservedKeyframe = findKeyframeBeforeTime({
        keyframes: info.keyframes,
        time,
    });
    // Check if we have `Cues`
    const byteFromCues = getByteFromCues({
        cuesResponse,
        time,
        info,
        logLevel,
    });
    // Fallback: back to the beginning
    const byteFromFirstMediaSection = (_c = (_b = webmState.getFirstCluster()) === null || _b === void 0 ? void 0 : _b.start) !== null && _c !== void 0 ? _c : null;
    // Optimization possibility for later:
    // Don't seek back, if the last seen time is smaller than the time we want to seek to
    const seekPossibilities = [
        (_d = byteFromCues === null || byteFromCues === void 0 ? void 0 : byteFromCues.byte) !== null && _d !== void 0 ? _d : null,
        (_e = byteFromObservedKeyframe === null || byteFromObservedKeyframe === void 0 ? void 0 : byteFromObservedKeyframe.positionInBytes) !== null && _e !== void 0 ? _e : null,
        byteFromFirstMediaSection,
    ].filter((n) => n !== null);
    const byteToSeekTo = seekPossibilities.length === 0 ? null : Math.max(...seekPossibilities);
    if (byteToSeekTo === null) {
        // dont know what to do
        return {
            type: 'invalid',
        };
    }
    // we have assured this is in a media section, but it might not be marked yet
    // setting size because there is deduplication and media sections which are encompassed
    // by others will get deleted
    mediaSection.addMediaSection({
        start: byteToSeekTo,
        size: 1,
    });
    const timeInSeconds = (() => {
        if (byteToSeekTo === (byteFromObservedKeyframe === null || byteFromObservedKeyframe === void 0 ? void 0 : byteFromObservedKeyframe.positionInBytes)) {
            return Math.min(byteFromObservedKeyframe.decodingTimeInSeconds, byteFromObservedKeyframe.presentationTimeInSeconds);
        }
        if (byteToSeekTo === (byteFromCues === null || byteFromCues === void 0 ? void 0 : byteFromCues.byte)) {
            return byteFromCues.timeInSeconds;
        }
        if (byteToSeekTo === byteFromFirstMediaSection) {
            return 0;
        }
        throw new Error('Should not happen');
    })();
    return {
        type: 'do-seek',
        byte: byteToSeekTo,
        timeInSeconds,
    };
};
exports.getSeekingByteFromMatroska = getSeekingByteFromMatroska;
