"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movieTimeScaleState = void 0;
const movieTimeScaleState = () => {
    let trackTimescale = null;
    return {
        getTrackTimescale: () => trackTimescale,
        setTrackTimescale: (timescale) => {
            trackTimescale = timescale;
        },
    };
};
exports.movieTimeScaleState = movieTimeScaleState;
