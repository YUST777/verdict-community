"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJpeg = void 0;
exports.getJpegDimensions = getJpegDimensions;
const detect_file_type_1 = require("./detect-file-type");
function getJpegDimensions(data) {
    let offset = 0;
    // Helper function to read a 16-bit big-endian integer
    function readUint16BE(o) {
        return (data[o] << 8) | data[o + 1];
    }
    // Skip the Start of Image (SOI) marker
    if (readUint16BE(offset) !== 0xffd8) {
        return null; // Not a valid JPEG file
    }
    offset += 2;
    while (offset < data.length) {
        if (data[offset] === 0xff) {
            const marker = data[offset + 1];
            if (marker === 0xc0 || marker === 0xc2) {
                // SOF0 or SOF2
                const height = readUint16BE(offset + 5);
                const width = readUint16BE(offset + 7);
                return { width, height };
            }
            const length = readUint16BE(offset + 2);
            offset += length + 2; // Move to the next marker
        }
        else {
            offset++;
        }
    }
    return null; // Return null if dimensions are not found
}
const isJpeg = (data) => {
    const jpegPattern = new Uint8Array([0xff, 0xd8]);
    const jpeg = (0, detect_file_type_1.matchesPattern)(jpegPattern)(data.subarray(0, 2));
    if (!jpeg) {
        return null;
    }
    const dim = getJpegDimensions(data);
    return { dimensions: dim, type: 'jpeg' };
};
exports.isJpeg = isJpeg;
