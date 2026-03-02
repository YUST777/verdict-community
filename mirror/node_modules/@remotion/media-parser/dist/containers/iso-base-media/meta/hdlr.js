"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHdlr = void 0;
const parseHdlr = ({ iterator, size, offset, }) => {
    const box = iterator.startBox(size - 8);
    const version = iterator.getUint8();
    if (version !== 0) {
        throw new Error(`Unsupported hdlr version: ${version}`);
    }
    // version
    iterator.discard(3);
    // predefined
    iterator.discard(4);
    // type
    const hdlrType = iterator.getByteString(4, false);
    // component manufactor
    iterator.discard(4);
    // component flags
    iterator.discard(4);
    // component flags mask
    iterator.discard(4);
    // component name
    const componentName = iterator.readUntilNullTerminator();
    box.discardRest();
    return Promise.resolve({
        type: 'hdlr-box',
        boxSize: size,
        offset,
        hdlrType,
        componentName,
    });
};
exports.parseHdlr = parseHdlr;
