"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCues = void 0;
const formatCues = (cues) => {
    var _a;
    const matroskaCues = [];
    for (const cue of cues) {
        if (cue.type === 'Crc32') {
            continue;
        }
        if (cue.type !== 'CuePoint') {
            throw new Error('Expected CuePoint');
        }
        const cueTime = cue.value.find((_cue) => _cue.type === 'CueTime');
        if (!cueTime) {
            throw new Error('Expected CueTime');
        }
        const cueTrackPositions = cue.value.find((c) => c.type === 'CueTrackPositions');
        if (!cueTrackPositions) {
            throw new Error('Expected CueTrackPositions');
        }
        const cueTimeValue = cueTime.value.value;
        const cueTrack = cueTrackPositions.value.find((_c) => _c.type === 'CueTrack');
        if (!cueTrack) {
            throw new Error('Expected CueTrack');
        }
        const cueClusterPosition = cueTrackPositions.value.find((_c) => _c.type === 'CueClusterPosition');
        if (!cueClusterPosition) {
            throw new Error('Expected CueClusterPosition');
        }
        const cueRelativePosition = cueTrackPositions.value.find((_c) => _c.type === 'CueRelativePosition');
        const matroskaCue = {
            trackId: cueTrack.value.value,
            timeInTimescale: cueTimeValue,
            clusterPositionInSegment: cueClusterPosition.value.value,
            relativePosition: (_a = cueRelativePosition === null || cueRelativePosition === void 0 ? void 0 : cueRelativePosition.value.value) !== null && _a !== void 0 ? _a : 0,
        };
        matroskaCues.push(matroskaCue);
    }
    return matroskaCues;
};
exports.formatCues = formatCues;
