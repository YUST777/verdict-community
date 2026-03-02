"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTracksSectionState = void 0;
const log_1 = require("../log");
const makeTracksSectionState = (canSkipTracksState, src) => {
    const tracks = [];
    let doneWithTracks = false;
    return {
        hasAllTracks: () => doneWithTracks,
        getIsDone: () => doneWithTracks,
        setIsDone: (logLevel) => {
            if (doneWithTracks) {
                throw new Error('Error in Media Parser: Tracks have already been parsed');
            }
            log_1.Log.verbose(logLevel, 'All tracks have been parsed');
            doneWithTracks = true;
        },
        addTrack: (track) => {
            tracks.push(track);
        },
        getTracks: () => {
            return tracks;
        },
        ensureHasTracksAtEnd: (fields) => {
            if (canSkipTracksState.canSkipTracks()) {
                return;
            }
            if (!fields.tracks) {
                return;
            }
            if (!doneWithTracks) {
                throw new Error('Error in Media Parser: End of parsing of ' +
                    src +
                    ' has been reached, but no tracks have been found ');
            }
        },
    };
};
exports.makeTracksSectionState = makeTracksSectionState;
