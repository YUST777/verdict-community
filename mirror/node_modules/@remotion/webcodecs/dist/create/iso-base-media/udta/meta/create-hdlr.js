"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHdlr = void 0;
const matroska_utils_1 = require("../../../matroska/matroska-utils");
const primitives_1 = require("../../primitives");
const createHdlr = (type) => {
    return (0, primitives_1.addSize)((0, matroska_utils_1.combineUint8Arrays)([
        // type
        (0, primitives_1.stringsToUint8Array)('hdlr'),
        // version
        new Uint8Array([0]),
        // flags
        new Uint8Array([0, 0, 0]),
        // pre_defined
        new Uint8Array([0, 0, 0, 0]),
        // handler_type
        (0, primitives_1.stringsToUint8Array)(type === 'mdir' ? 'mdir' : type === 'video' ? 'vide' : 'soun'),
        // reserved
        type === 'mdir'
            ? (0, primitives_1.numberTo32BitUIntOrInt)(1634758764)
            : new Uint8Array([0, 0, 0, 0]),
        new Uint8Array([0, 0, 0, 0]),
        new Uint8Array([0, 0, 0, 0]),
        // name
        (0, primitives_1.stringsToUint8Array)(type === 'mdir'
            ? '\0'
            : type === 'video'
                ? 'VideoHandler\0'
                : 'SoundHandler\0'),
    ]));
};
exports.createHdlr = createHdlr;
