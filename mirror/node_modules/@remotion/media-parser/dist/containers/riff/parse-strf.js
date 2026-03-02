"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStrf = void 0;
const parseStrfAudio = ({ iterator, size, }) => {
    const box = iterator.startBox(size);
    const formatTag = iterator.getUint16Le();
    const numberOfChannels = iterator.getUint16Le();
    const samplesPerSec = iterator.getUint32Le();
    const avgBytesPerSec = iterator.getUint32Le();
    const blockAlign = iterator.getUint16Le();
    const bitsPerSample = iterator.getUint16Le();
    const cbSize = iterator.getUint16Le();
    box.expectNoMoreBytes();
    return {
        type: 'strf-box-audio',
        avgBytesPerSecond: avgBytesPerSec,
        bitsPerSample,
        blockAlign,
        cbSize,
        formatTag,
        numberOfChannels,
        sampleRate: samplesPerSec,
    };
};
const parseStrfVideo = ({ iterator, size, }) => {
    const box = iterator.startBox(size);
    const biSize = iterator.getUint32Le();
    const width = iterator.getInt32Le();
    const height = iterator.getInt32Le();
    const planes = iterator.getUint16Le();
    const bitCount = iterator.getUint16Le();
    const compression = iterator.getByteString(4, false);
    const sizeImage = iterator.getUint32Le();
    const xPelsPerMeter = iterator.getInt32Le();
    const yPelsPerMeter = iterator.getInt32Le();
    const clrUsed = iterator.getUint32Le();
    const clrImportant = iterator.getUint32Le();
    box.expectNoMoreBytes();
    return {
        type: 'strf-box-video',
        biSize,
        bitCount,
        clrImportant,
        clrUsed,
        compression,
        height,
        planes,
        sizeImage,
        width,
        xPelsPerMeter,
        yPelsPerMeter,
    };
};
const parseStrf = ({ iterator, size, fccType, }) => {
    if (fccType === 'vids') {
        return parseStrfVideo({ iterator, size });
    }
    if (fccType === 'auds') {
        return parseStrfAudio({ iterator, size });
    }
    throw new Error(`Unsupported fccType: ${fccType}`);
};
exports.parseStrf = parseStrf;
