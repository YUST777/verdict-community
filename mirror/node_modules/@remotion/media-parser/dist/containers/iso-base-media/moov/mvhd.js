"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMvhd = void 0;
const buffer_iterator_1 = require("../../../iterator/buffer-iterator");
const to_date_1 = require("../to-date");
const parseMvhd = ({ iterator, offset, size, }) => {
    const version = iterator.getUint8();
    // Flags, we discard them
    iterator.discard(3);
    const creationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
    const modificationTime = version === 1 ? iterator.getUint64() : iterator.getUint32();
    const timeScale = iterator.getUint32();
    const durationInUnits = version === 1 ? iterator.getUint64() : iterator.getUint32();
    const durationInSeconds = Number(durationInUnits) / timeScale;
    const rateArray = iterator.getSlice(4);
    const rateView = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: rateArray,
        maxBytes: rateArray.length,
        logLevel: 'error',
    });
    const rate = rateView.getInt8() * 10 +
        rateView.getInt8() +
        rateView.getInt8() * 0.1 +
        rateView.getInt8() * 0.01;
    const volumeArray = iterator.getSlice(2);
    const volumeView = (0, buffer_iterator_1.getArrayBufferIterator)({
        initialData: volumeArray,
        maxBytes: volumeArray.length,
        logLevel: 'error',
    });
    const volume = volumeView.getInt8() + volumeView.getInt8() * 0.1;
    // reserved 16bit
    iterator.discard(2);
    // reserved 32bit x2
    iterator.discard(4);
    iterator.discard(4);
    // matrix
    const matrix = [
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned1616Number(),
        iterator.getFixedPointSigned230Number(),
    ];
    // pre-defined
    iterator.discard(4 * 6);
    // next track id
    const nextTrackId = iterator.getUint32();
    volumeView.destroy();
    const bytesRemaining = size - (iterator.counter.getOffset() - offset);
    if (bytesRemaining !== 0) {
        throw new Error('expected 0 bytes ' + bytesRemaining);
    }
    return {
        creationTime: (0, to_date_1.toUnixTimestamp)(Number(creationTime)),
        modificationTime: (0, to_date_1.toUnixTimestamp)(Number(modificationTime)),
        timeScale,
        durationInUnits: Number(durationInUnits),
        durationInSeconds,
        rate,
        volume,
        matrix: matrix,
        nextTrackId,
        type: 'mvhd-box',
        boxSize: size,
        offset,
    };
};
exports.parseMvhd = parseMvhd;
