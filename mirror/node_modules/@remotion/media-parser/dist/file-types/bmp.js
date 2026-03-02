"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBmp = void 0;
const detect_file_type_1 = require("./detect-file-type");
function getBmpDimensions(bmpData) {
    if (bmpData.length < 26) {
        return null;
    }
    const view = new DataView(bmpData.buffer, bmpData.byteOffset);
    return {
        width: view.getUint32(18, true),
        height: Math.abs(view.getInt32(22, true)),
    };
}
const isBmp = (data) => {
    const bmpPattern = new Uint8Array([0x42, 0x4d]);
    if ((0, detect_file_type_1.matchesPattern)(bmpPattern)(data.subarray(0, 2))) {
        const bmp = getBmpDimensions(data);
        return { dimensions: bmp, type: 'bmp' };
    }
    return null;
};
exports.isBmp = isBmp;
