"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyframesState = void 0;
const keyframesState = () => {
    const keyframes = [];
    const addKeyframe = (keyframe) => {
        if (keyframes.find((k) => k.positionInBytes === keyframe.positionInBytes)) {
            return;
        }
        keyframes.push(keyframe);
    };
    const getKeyframes = () => {
        keyframes.sort((a, b) => a.positionInBytes - b.positionInBytes);
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
exports.keyframesState = keyframesState;
