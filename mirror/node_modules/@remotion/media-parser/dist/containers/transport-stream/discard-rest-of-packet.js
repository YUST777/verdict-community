"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestOfPacket = exports.discardRestOfPacket = void 0;
const discardRestOfPacket = (iterator) => {
    const next188 = 188 - (iterator.counter.getOffset() % 188);
    iterator.discard(next188);
};
exports.discardRestOfPacket = discardRestOfPacket;
const getRestOfPacket = (iterator) => {
    const next188 = 188 - (iterator.counter.getOffset() % 188);
    return iterator.getSlice(next188);
};
exports.getRestOfPacket = getRestOfPacket;
