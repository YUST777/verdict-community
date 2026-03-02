"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTrackMediaTimeOffsetInTrackTimescale = exports.findTrackStartTimeInSeconds = void 0;
const traversal_1 = require("../traversal");
const findTrackStartTimeInSeconds = ({ movieTimeScale, trakBox, }) => {
    const elstBox = (0, traversal_1.getElstBox)(trakBox);
    if (!elstBox) {
        return 0;
    }
    const { entries } = elstBox;
    let dwellTime = 0;
    for (const entry of entries) {
        const { editDuration, mediaTime } = entry;
        if (mediaTime !== -1) {
            continue;
        }
        dwellTime += editDuration;
    }
    return dwellTime / movieTimeScale;
};
exports.findTrackStartTimeInSeconds = findTrackStartTimeInSeconds;
const findTrackMediaTimeOffsetInTrackTimescale = ({ trakBox, }) => {
    const elstBox = (0, traversal_1.getElstBox)(trakBox);
    if (!elstBox) {
        return 0;
    }
    const { entries } = elstBox;
    let dwellTime = 0;
    for (const entry of entries) {
        const { mediaTime } = entry;
        if (mediaTime === -1) {
            continue;
        }
        dwellTime += mediaTime;
    }
    return dwellTime;
};
exports.findTrackMediaTimeOffsetInTrackTimescale = findTrackMediaTimeOffsetInTrackTimescale;
