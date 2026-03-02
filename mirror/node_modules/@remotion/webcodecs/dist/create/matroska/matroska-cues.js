"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatroskaCues = void 0;
const matroska_utils_1 = require("./matroska-utils");
const createMatroskaCues = (cues) => {
    if (cues.length === 0) {
        return null;
    }
    return (0, matroska_utils_1.makeMatroskaBytes)({
        type: 'Cues',
        minVintWidth: null,
        value: cues.map((cue) => {
            return {
                type: 'CuePoint',
                value: [
                    {
                        type: 'CueTime',
                        minVintWidth: null,
                        value: {
                            value: cue.time,
                            byteLength: null,
                        },
                    },
                    {
                        type: 'CueTrackPositions',
                        value: [
                            {
                                type: 'CueTrack',
                                minVintWidth: null,
                                value: {
                                    value: cue.trackNumber,
                                    byteLength: null,
                                },
                            },
                            {
                                type: 'CueClusterPosition',
                                minVintWidth: null,
                                value: {
                                    value: cue.clusterPosition,
                                    byteLength: null,
                                },
                            },
                        ],
                        minVintWidth: null,
                    },
                ],
                minVintWidth: null,
            };
        }),
    });
};
exports.createMatroskaCues = createMatroskaCues;
