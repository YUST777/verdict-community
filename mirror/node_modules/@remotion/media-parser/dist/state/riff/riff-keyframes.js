"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riffKeyframesState = void 0;
const riffKeyframesState = () => {
    const keyframes = [];
    const addKeyframe = (keyframe) => {
        if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
            return;
        }
        keyframes.push(keyframe);
        keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
    };
    const getKeyframes = () => {
        return keyframes;
    };
    const setFromSeekingHints = (keyframesFromHints) => {
        for (const keyframe of keyframesFromHints) {
            addKeyframe(keyframe);
        }
    };
    return {
        addKeyframe,
        getKeyframes,
        setFromSeekingHints,
    };
};
exports.riffKeyframesState = riffKeyframesState;
