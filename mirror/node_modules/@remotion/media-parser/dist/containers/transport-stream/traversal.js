"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamForId = exports.getProgramForId = exports.findProgramMapTableOrThrow = exports.findProgramMapOrNull = void 0;
const findProgramAssociationTableOrThrow = (structure) => {
    const box = structure.boxes.find((b) => b.type === 'transport-stream-pat-box');
    if (!box) {
        throw new Error('No PAT box found');
    }
    return box;
};
const findProgramMapOrNull = (structure) => {
    const box = structure.boxes.find((b) => b.type === 'transport-stream-pmt-box');
    if (!box) {
        return null;
    }
    return box;
};
exports.findProgramMapOrNull = findProgramMapOrNull;
const findProgramMapTableOrThrow = (structure) => {
    const box = (0, exports.findProgramMapOrNull)(structure);
    if (!box) {
        throw new Error('No PMT box found');
    }
    return box;
};
exports.findProgramMapTableOrThrow = findProgramMapTableOrThrow;
const getProgramForId = (structure, packetIdentifier) => {
    const box = findProgramAssociationTableOrThrow(structure);
    const entry = box.pat.find((e) => e.programMapIdentifier === packetIdentifier);
    return entry !== null && entry !== void 0 ? entry : null;
};
exports.getProgramForId = getProgramForId;
const getStreamForId = (structure, packetIdentifier) => {
    const box = (0, exports.findProgramMapTableOrThrow)(structure);
    const entry = box.streams.find((e) => e.pid === packetIdentifier);
    return entry !== null && entry !== void 0 ? entry : null;
};
exports.getStreamForId = getStreamForId;
