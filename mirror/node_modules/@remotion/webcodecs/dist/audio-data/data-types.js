"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataTypeForAudioFormat = void 0;
const getDataTypeForAudioFormat = (format) => {
    switch (format) {
        case 'f32':
            return Float32Array;
        case 'f32-planar':
            return Float32Array;
        case 's16':
            return Int16Array;
        case 's16-planar':
            return Int16Array;
        case 'u8':
            return Uint8Array;
        case 'u8-planar':
            return Uint8Array;
        case 's32':
            return Int32Array;
        case 's32-planar':
            return Int32Array;
        default:
            throw new Error(`Unsupported audio format: ${format}`);
    }
};
exports.getDataTypeForAudioFormat = getDataTypeForAudioFormat;
