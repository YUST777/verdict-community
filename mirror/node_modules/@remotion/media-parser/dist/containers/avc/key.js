"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyFrameOrDeltaFromAvcInfo = void 0;
const getKeyFrameOrDeltaFromAvcInfo = (infos) => {
    const keyOrDelta = infos.find((i) => i.type === 'keyframe' || i.type === 'delta-frame');
    if (!keyOrDelta) {
        throw new Error('expected avc to contain info about key or delta');
    }
    return keyOrDelta.type === 'keyframe'
        ? 'key'
        : keyOrDelta.isBidirectionalFrame
            ? 'bidirectional'
            : 'delta';
};
exports.getKeyFrameOrDeltaFromAvcInfo = getKeyFrameOrDeltaFromAvcInfo;
