"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeProgressTracker = void 0;
const event_emitter_1 = require("./event-emitter");
// Make sure to distinguish null and undefined here
const makeProgressTracker = () => {
    const trackNumberProgresses = {};
    const eventEmitter = new event_emitter_1.IoEventEmitter();
    let startingTimestamp = null;
    const setPossibleLowestTimestamp = (timestamp) => {
        if (startingTimestamp === null) {
            startingTimestamp = timestamp;
        }
        else {
            startingTimestamp = Math.min(startingTimestamp, timestamp);
        }
    };
    const getSmallestProgress = () => {
        const progressValues = Object.values(trackNumberProgresses).map((p) => {
            if (p !== null) {
                return p;
            }
            // The starting timestamp might not be 0, it might be very huge
            // If no sample has arrived yet, we should assume the smallest value
            // we know as the progress
            if (startingTimestamp === null) {
                throw new Error('No progress values to calculate smallest progress from');
            }
            return startingTimestamp;
        });
        return Math.min(...progressValues);
    };
    return {
        registerTrack: (trackNumber) => {
            trackNumberProgresses[trackNumber] = null;
        },
        getSmallestProgress,
        updateTrackProgress: (trackNumber, progress) => {
            if (trackNumberProgresses[trackNumber] === undefined) {
                throw new Error(`Tried to update progress for a track that was not registered: ${trackNumber}`);
            }
            trackNumberProgresses[trackNumber] = progress;
            eventEmitter.dispatchEvent('progress', {
                smallestProgress: getSmallestProgress(),
            });
        },
        setPossibleLowestTimestamp,
    };
};
exports.makeProgressTracker = makeProgressTracker;
