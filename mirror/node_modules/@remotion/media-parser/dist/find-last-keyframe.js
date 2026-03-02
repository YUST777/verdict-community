"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLastKeyframe = findLastKeyframe;
function findLastKeyframe({ keyframes, timeInSeconds, }) {
    let bestKeyframe = null;
    for (const keyframe of keyframes) {
        if (keyframe.presentationTimeInSeconds > timeInSeconds &&
            keyframe.decodingTimeInSeconds > timeInSeconds) {
            break;
        }
        if (bestKeyframe === null ||
            keyframe.presentationTimeInSeconds >
                bestKeyframe.presentationTimeInSeconds) {
            bestKeyframe = keyframe;
        }
    }
    return bestKeyframe;
}
