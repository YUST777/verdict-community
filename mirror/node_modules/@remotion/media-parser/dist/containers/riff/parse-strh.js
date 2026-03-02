"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStrh = void 0;
const parse_strf_1 = require("./parse-strf");
const parseStrh = ({ iterator, size, }) => {
    const box = iterator.startBox(size);
    const fccType = iterator.getByteString(4, false);
    if (fccType !== 'vids' && fccType !== 'auds') {
        throw new Error('Expected AVI handler to be vids / auds');
    }
    const handler = fccType === 'vids'
        ? iterator.getByteString(4, false)
        : iterator.getUint32Le();
    if (typeof handler === 'string' && handler !== 'H264') {
        throw new Error(`Only H264 is supported as a stream type in .avi, got ${handler}`);
    }
    if (fccType === 'auds' && handler !== 1) {
        throw new Error(`Only "1" is supported as a stream type in .avi, got ${handler}`);
    }
    const flags = iterator.getUint32Le();
    const priority = iterator.getUint16Le();
    const language = iterator.getUint16Le();
    const initialFrames = iterator.getUint32Le();
    const scale = iterator.getUint32Le();
    const rate = iterator.getUint32Le();
    const start = iterator.getUint32Le();
    const length = iterator.getUint32Le();
    const suggestedBufferSize = iterator.getUint32Le();
    const quality = iterator.getUint32Le();
    const sampleSize = iterator.getUint32Le();
    box.discardRest();
    const ckId = iterator.getByteString(4, false);
    const ckSize = iterator.getUint32Le();
    if (ckId !== 'strf') {
        throw new Error(`Expected strf, got ${JSON.stringify(ckId)}`);
    }
    if (iterator.bytesRemaining() < ckSize) {
        throw new Error('Expected strf to be complete');
    }
    const strf = (0, parse_strf_1.parseStrf)({ iterator, size: ckSize, fccType });
    return {
        type: 'strh-box',
        fccType,
        handler,
        flags,
        priority,
        initialFrames,
        length,
        quality,
        rate,
        sampleSize,
        scale,
        start,
        suggestedBufferSize,
        language,
        strf,
    };
};
exports.parseStrh = parseStrh;
