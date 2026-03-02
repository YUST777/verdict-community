"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFtyp = void 0;
const parseFtyp = ({ iterator, size, offset, }) => {
    const majorBrand = iterator.getByteString(4, false);
    const minorVersion = iterator.getFourByteNumber();
    const types = (size - iterator.counter.getOffset()) / 4;
    const compatibleBrands = [];
    for (let i = 0; i < types; i++) {
        compatibleBrands.push(iterator.getByteString(4, false).trim());
    }
    const offsetAtEnd = iterator.counter.getOffset();
    return {
        type: 'ftyp-box',
        majorBrand,
        minorVersion,
        compatibleBrands,
        offset,
        boxSize: offsetAtEnd - offset,
    };
};
exports.parseFtyp = parseFtyp;
