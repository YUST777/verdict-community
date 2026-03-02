"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGif = void 0;
const detect_file_type_1 = require("./detect-file-type");
const getGifDimensions = (data) => {
    const view = new DataView(data.buffer, data.byteOffset);
    const width = view.getUint16(6, true);
    const height = view.getUint16(8, true);
    return { width, height };
};
const isGif = (data) => {
    const gifPattern = new Uint8Array([0x47, 0x49, 0x46, 0x38]);
    if ((0, detect_file_type_1.matchesPattern)(gifPattern)(data.subarray(0, 4))) {
        return { type: 'gif', dimensions: getGifDimensions(data) };
    }
    return null;
};
exports.isGif = isGif;
