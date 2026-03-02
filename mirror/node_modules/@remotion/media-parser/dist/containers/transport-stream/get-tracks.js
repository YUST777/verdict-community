"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAllTracksFromTransportStream = exports.getTracksFromTransportStream = exports.filterStreamsBySupportedTypes = void 0;
const truthy_1 = require("../../truthy");
const traversal_1 = require("./traversal");
const filterStreamsBySupportedTypes = (streams) => {
    return streams.filter((stream) => stream.streamType === 27 || stream.streamType === 15);
};
exports.filterStreamsBySupportedTypes = filterStreamsBySupportedTypes;
const getTracksFromTransportStream = (parserState) => {
    const structure = parserState.structure.getTsStructure();
    const programMapTable = (0, traversal_1.findProgramMapTableOrThrow)(structure);
    const parserTracks = parserState.callbacks.tracks.getTracks();
    const mapped = (0, exports.filterStreamsBySupportedTypes)(programMapTable.streams)
        .map((stream) => {
        return parserTracks.find((track) => track.trackId === stream.pid);
    })
        .filter(truthy_1.truthy);
    if (mapped.length !==
        (0, exports.filterStreamsBySupportedTypes)(programMapTable.streams).length) {
        throw new Error('Not all tracks found');
    }
    return mapped;
};
exports.getTracksFromTransportStream = getTracksFromTransportStream;
const hasAllTracksFromTransportStream = (parserState) => {
    try {
        (0, exports.getTracksFromTransportStream)(parserState);
        return true;
    }
    catch (_a) {
        return false;
    }
};
exports.hasAllTracksFromTransportStream = hasAllTracksFromTransportStream;
