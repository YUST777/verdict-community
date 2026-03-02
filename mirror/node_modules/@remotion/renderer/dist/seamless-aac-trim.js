"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActualTrimLeft = void 0;
const getActualTrimLeft = ({ fps, trimLeftOffset, seamless, assetDuration, audioStartFrame, trimLeft, playbackRate, }) => {
    const sinceStart = trimLeft - audioStartFrame;
    if (!seamless) {
        return {
            trimLeft: audioStartFrame / fps +
                (sinceStart / fps) * playbackRate +
                trimLeftOffset,
            maxTrim: assetDuration,
        };
    }
    if (seamless) {
        return {
            trimLeft: audioStartFrame / fps / playbackRate +
                sinceStart / fps +
                trimLeftOffset,
            maxTrim: assetDuration ? assetDuration / playbackRate : null,
        };
    }
    throw new Error('This should never happen');
};
exports.getActualTrimLeft = getActualTrimLeft;
