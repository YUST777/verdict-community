"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMoviAtom = void 0;
const isMoviAtom = (iterator, ckId) => {
    if (ckId !== 'LIST') {
        return false;
    }
    const listType = iterator.getByteString(4, false);
    iterator.counter.decrement(4);
    return listType === 'movi';
};
exports.isMoviAtom = isMoviAtom;
