"use strict";
// implementation of http://www.mp3-tech.org/programmer/sources/vbrheadersdk.zip
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeFromPosition = exports.getSeekPointInBytes = exports.parseXing = void 0;
const SAMPLE_RATES = [44100, 48000, 32000, 99999];
const FRAMES_FLAG = 0x0001;
const BYTES_FLAG = 0x0002;
const TOC_FLAG = 0x0004;
const VBR_SCALE_FLAG = 0x0008;
const extractI4 = (data, offset) => {
    let x = 0;
    x = data[offset];
    x <<= 8;
    x |= data[offset + 1];
    x <<= 8;
    x |= data[offset + 2];
    x <<= 8;
    x |= data[offset + 3];
    return x;
};
const parseXing = (data) => {
    const h_id = (data[1] >> 3) & 1;
    const h_sr_index = (data[2] >> 2) & 3;
    const h_mode = (data[3] >> 6) & 3;
    let xingOffset = 0;
    if (h_id) {
        // mpeg1
        if (h_mode !== 3) {
            xingOffset += 32 + 4;
        }
        else {
            xingOffset += 17 + 4;
        }
    }
    else if (h_mode !== 3) {
        xingOffset += 17 + 4;
    }
    else {
        xingOffset += 9 + 4;
    }
    const expectXing = new TextDecoder('utf8').decode(data.slice(xingOffset, xingOffset + 4));
    if (expectXing !== 'Xing') {
        throw new Error('Invalid Xing header');
    }
    let sampleRate = SAMPLE_RATES[h_sr_index];
    if (h_id === 0) {
        sampleRate >>= 1;
    }
    let offset = xingOffset + 4;
    const flags = extractI4(data, offset);
    offset += 4;
    let numberOfFrames;
    let fileSize;
    let tableOfContents;
    let vbrScale;
    if (flags & FRAMES_FLAG) {
        numberOfFrames = extractI4(data, offset);
        offset += 4;
    }
    if (flags & BYTES_FLAG) {
        fileSize = extractI4(data, offset);
        offset += 4;
    }
    if (flags & TOC_FLAG) {
        tableOfContents = data.slice(offset, offset + 100);
        offset += 100;
    }
    if (flags & VBR_SCALE_FLAG) {
        vbrScale = extractI4(data, offset);
        offset += 4;
    }
    // Allow extra data after the standard Xing fields, as some encoders add additional information
    if (offset > data.length) {
        throw new Error('xing header was parsed wrong: read beyond available data');
    }
    return {
        sampleRate,
        numberOfFrames: numberOfFrames !== null && numberOfFrames !== void 0 ? numberOfFrames : null,
        fileSize: fileSize !== null && fileSize !== void 0 ? fileSize : null,
        tableOfContents: tableOfContents
            ? Array.from(tableOfContents.slice(0, 100))
            : null,
        vbrScale: vbrScale !== null && vbrScale !== void 0 ? vbrScale : null,
    };
};
exports.parseXing = parseXing;
const getSeekPointInBytes = ({ fileSize, percentBetween0And100, tableOfContents, }) => {
    let index = Math.floor(percentBetween0And100);
    if (index > 99) {
        index = 99;
    }
    const fa = tableOfContents[index];
    let fb;
    if (index < 99) {
        fb = tableOfContents[index + 1];
    }
    else {
        fb = 256;
    }
    const fx = fa + (fb - fa) * (percentBetween0And100 - index);
    const seekPoint = (1 / 256) * fx * fileSize;
    return Math.floor(seekPoint);
};
exports.getSeekPointInBytes = getSeekPointInBytes;
const getTimeFromPosition = ({ position, fileSize, tableOfContents, durationInSeconds, }) => {
    // Convert position to a value between 0-256
    const positionNormalized = (position / fileSize) * 256;
    // Find the closest indices in the table of contents
    let index = 0;
    while (index < 99 && tableOfContents[index + 1] <= positionNormalized) {
        index++;
    }
    const fa = tableOfContents[index];
    const fb = index < 99 ? tableOfContents[index + 1] : 256;
    // Interpolate between the two points
    const percentWithinSegment = (positionNormalized - fa) / (fb - fa);
    const percentBetween0And100 = index + percentWithinSegment;
    // Convert percentage to time
    return (percentBetween0And100 / 100) * durationInSeconds;
};
exports.getTimeFromPosition = getTimeFromPosition;
