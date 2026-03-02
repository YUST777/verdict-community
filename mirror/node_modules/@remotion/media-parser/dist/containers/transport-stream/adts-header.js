"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAdtsHeader = void 0;
const aac_codecprivate_1 = require("../../aac-codecprivate");
const buffer_iterator_1 = require("../../iterator/buffer-iterator");
const readAdtsHeader = (buffer) => {
    if (buffer.byteLength < 9) {
        return null;
    }
    const iterator = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: buffer,
        maxBytes: buffer.byteLength,
        logLevel: 'error',
    });
    iterator.startReadingBits();
    const bits = iterator.getBits(12);
    if (bits !== 0xfff) {
        throw new Error('Invalid ADTS header ');
    }
    // MPEG Version, set to 0 for MPEG-4 and 1 for MPEG-2.
    const id = iterator.getBits(1);
    if (id !== 0) {
        throw new Error('Only supporting MPEG-4 for .ts');
    }
    const layer = iterator.getBits(2);
    if (layer !== 0) {
        throw new Error('Only supporting layer 0 for .ts');
    }
    const protectionAbsent = iterator.getBits(1); // protection absent
    const audioObjectType = iterator.getBits(2); // 1 = 'AAC-LC'
    const samplingFrequencyIndex = iterator.getBits(4);
    const sampleRate = (0, aac_codecprivate_1.getSampleRateFromSampleFrequencyIndex)(samplingFrequencyIndex);
    iterator.getBits(1); // private bit
    const channelConfiguration = iterator.getBits(3);
    const codecPrivate = (0, aac_codecprivate_1.createAacCodecPrivate)({
        audioObjectType,
        sampleRate,
        channelConfiguration,
        codecPrivate: null,
    });
    iterator.getBits(1); // originality
    iterator.getBits(1); // home
    iterator.getBits(1); // copyright bit
    iterator.getBits(1); // copy start
    const frameLength = iterator.getBits(13); // frame length
    iterator.getBits(11); // buffer fullness
    iterator.getBits(2); // number of AAC frames minus 1
    if (!protectionAbsent) {
        iterator.getBits(16); // crc
    }
    iterator.stopReadingBits();
    iterator.destroy();
    return {
        frameLength,
        codecPrivate,
        channelConfiguration,
        sampleRate,
        audioObjectType,
    };
};
exports.readAdtsHeader = readAdtsHeader;
