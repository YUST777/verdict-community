"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMfraSeekingBox = void 0;
const get_children_1 = require("./get-children");
const get_mfra_atom_1 = require("./mfra/get-mfra-atom");
const get_mfro_atom_1 = require("./mfra/get-mfro-atom");
const getMfraSeekingBox = async ({ contentLength, controller, readerInterface, src, logLevel, prefetchCache, }) => {
    const parentSize = await (0, get_mfro_atom_1.getMfroAtom)({
        contentLength,
        controller,
        readerInterface,
        src,
        logLevel,
        prefetchCache,
    });
    if (!parentSize) {
        return null;
    }
    const mfraAtom = await (0, get_mfra_atom_1.getMfraAtom)({
        contentLength,
        controller,
        readerInterface,
        src,
        parentSize,
        logLevel,
        prefetchCache,
    });
    mfraAtom.discard(8);
    return (0, get_children_1.getIsoBaseMediaChildren)({
        iterator: mfraAtom,
        logLevel,
        size: parentSize - 8,
        onlyIfMoovAtomExpected: null,
        contentLength,
    });
};
exports.getMfraSeekingBox = getMfraSeekingBox;
