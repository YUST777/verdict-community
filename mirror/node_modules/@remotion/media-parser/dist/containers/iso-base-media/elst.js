"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseElst = void 0;
const parseElst = ({ iterator, size, offset, }) => {
    const { discardRest } = iterator.startBox(size - 8);
    const version = iterator.getUint8();
    const flags = iterator.getUint24();
    const entryCount = iterator.getUint32();
    const entries = [];
    for (let i = 0; i < entryCount; i++) {
        const editDuration = Number(version === 1 ? iterator.getUint64() : iterator.getUint32());
        const mediaTime = Number(version === 1 ? iterator.getUint64() : iterator.getInt32());
        const mediaRateInteger = iterator.getUint16();
        const mediaRateFraction = iterator.getUint16();
        entries.push({
            editDuration,
            mediaTime,
            mediaRateInteger,
            mediaRateFraction,
        });
    }
    discardRest();
    const result = {
        type: 'elst-box',
        version,
        flags,
        entries,
        boxSize: size,
        offset,
    };
    return result;
};
exports.parseElst = parseElst;
