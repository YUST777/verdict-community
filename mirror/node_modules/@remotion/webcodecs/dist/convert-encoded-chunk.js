"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertEncodedChunk = void 0;
const convertEncodedChunk = (chunk) => {
    const arr = new Uint8Array(chunk.byteLength);
    chunk.copyTo(arr);
    return {
        data: arr,
        duration: chunk.duration ?? undefined,
        timestamp: chunk.timestamp,
        type: chunk.type,
        decodingTimestamp: chunk.timestamp,
        offset: 0,
    };
};
exports.convertEncodedChunk = convertEncodedChunk;
