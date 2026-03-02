"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padMatroskaBytes = exports.makeMatroskaBytes = exports.getVariableInt = exports.measureEBMLVarInt = exports.matroskaToHex = exports.incrementOffsetAndChildren = exports.combineUint8Arrays = exports.getIdForName = void 0;
exports.serializeUint16 = serializeUint16;
const media_parser_1 = require("@remotion/media-parser");
const getIdForName = (name) => {
    const value = Object.entries(media_parser_1.MediaParserInternals.matroskaElements).find(([key]) => key === name)?.[1];
    if (!value) {
        throw new Error(`Could not find id for name ${name}`);
    }
    return value;
};
exports.getIdForName = getIdForName;
function putUintDynamic(number, minimumLength) {
    if (number < 0) {
        throw new Error('This function is designed for non-negative integers only.');
    }
    // Calculate the minimum number of bytes needed to store the integer
    const length = Math.max(minimumLength ?? 1, Math.ceil(Math.log2(number + 1) / 8));
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        // Extract each byte from the number
        bytes[length - 1 - i] = (number >> (8 * i)) & 0xff;
    }
    return bytes;
}
const makeFromStructure = (fields) => {
    if ('bytes' in fields) {
        return fields;
    }
    const arrays = [];
    const struct = media_parser_1.MediaParserInternals.ebmlMap[(0, exports.getIdForName)(fields.type)];
    if (struct.type === 'uint8array') {
        return {
            bytes: fields.value,
            offsets: { offset: 0, children: [], field: fields.type },
        };
    }
    if (struct.type === 'children') {
        const children = [];
        let bytesWritten = 0;
        for (const item of fields.value) {
            const { bytes, offsets } = (0, exports.makeMatroskaBytes)(item);
            arrays.push(bytes);
            children.push((0, exports.incrementOffsetAndChildren)(offsets, bytesWritten));
            bytesWritten += bytes.byteLength;
        }
        return {
            bytes: (0, exports.combineUint8Arrays)(arrays),
            offsets: { offset: 0, children, field: fields.type },
        };
    }
    if (struct.type === 'string') {
        return {
            bytes: new TextEncoder().encode(fields.value),
            offsets: {
                children: [],
                offset: 0,
                field: fields.type,
            },
        };
    }
    if (struct.type === 'uint') {
        return {
            bytes: putUintDynamic(fields.value.value, fields.value.byteLength),
            offsets: {
                children: [],
                offset: 0,
                field: fields.type,
            },
        };
    }
    if (struct.type === 'hex-string') {
        const hex = fields.value.substring(2);
        const arr = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            const byte = parseInt(hex.substring(i, i + 2), 16);
            arr[i / 2] = byte;
        }
        return {
            bytes: arr,
            offsets: {
                children: [],
                offset: 0,
                field: fields.type,
            },
        };
    }
    if (struct.type === 'float') {
        const value = fields.value;
        if (value.size === '32') {
            const dataView = new DataView(new ArrayBuffer(4));
            dataView.setFloat32(0, value.value);
            return {
                bytes: new Uint8Array(dataView.buffer),
                offsets: {
                    children: [],
                    offset: 0,
                    field: fields.type,
                },
            };
        }
        const dataView2 = new DataView(new ArrayBuffer(8));
        dataView2.setFloat64(0, value.value);
        return {
            bytes: new Uint8Array(dataView2.buffer),
            offsets: {
                children: [],
                offset: 0,
                field: fields.type,
            },
        };
    }
    throw new Error('Unexpected type');
};
const combineUint8Arrays = (arrays) => {
    if (arrays.length === 0) {
        return new Uint8Array([]);
    }
    if (arrays.length === 1) {
        return arrays[0];
    }
    let totalLength = 0;
    for (const array of arrays) {
        totalLength += array.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const array of arrays) {
        result.set(array, offset);
        offset += array.length;
    }
    return result;
};
exports.combineUint8Arrays = combineUint8Arrays;
const incrementOffsetAndChildren = (offset, increment) => {
    return {
        offset: offset.offset + increment,
        children: offset.children.map((c) => (0, exports.incrementOffsetAndChildren)(c, increment)),
        field: offset.field,
    };
};
exports.incrementOffsetAndChildren = incrementOffsetAndChildren;
const matroskaToHex = (matrId) => {
    const numbers = new Uint8Array((matrId.length - 2) / 2);
    for (let i = 2; i < matrId.length; i += 2) {
        const hex = matrId.substring(i, i + 2);
        numbers[(i - 2) / 2] = parseInt(hex, 16);
    }
    return numbers;
};
exports.matroskaToHex = matroskaToHex;
// https://github.com/Vanilagy/webm-muxer/blob/main/src/ebml.ts#L101
const measureEBMLVarInt = (value) => {
    if (value < (1 << 7) - 1) {
        /** Top bit is set, leaving 7 bits to hold the integer, but we can't store
         * 127 because "all bits set to one" is a reserved value. Same thing for the
         * other cases below:
         */
        return 1;
    }
    if (value < (1 << 14) - 1) {
        return 2;
    }
    if (value < (1 << 21) - 1) {
        return 3;
    }
    if (value < (1 << 28) - 1) {
        return 4;
    }
    if (value < 2 ** 35 - 1) {
        return 5;
    }
    if (value < 2 ** 42 - 1) {
        return 6;
    }
    throw new Error('EBML VINT size not supported ' + value);
};
exports.measureEBMLVarInt = measureEBMLVarInt;
const getVariableInt = (value, minWidth) => {
    const width = Math.max((0, exports.measureEBMLVarInt)(value), minWidth ?? 0);
    switch (width) {
        case 1:
            return new Uint8Array([(1 << 7) | value]);
        case 2:
            return new Uint8Array([(1 << 6) | (value >> 8), value]);
        case 3:
            return new Uint8Array([(1 << 5) | (value >> 16), value >> 8, value]);
        case 4:
            return new Uint8Array([
                (1 << 4) | (value >> 24),
                value >> 16,
                value >> 8,
                value,
            ]);
        case 5:
            /**
             * JavaScript converts its doubles to 32-bit integers for bitwise
             * operations, so we need to do a division by 2^32 instead of a
             * right-shift of 32 to retain those top 3 bits
             */
            return new Uint8Array([
                (1 << 3) | ((value / 2 ** 32) & 0x7),
                value >> 24,
                value >> 16,
                value >> 8,
                value,
            ]);
        case 6:
            return new Uint8Array([
                (1 << 2) | ((value / 2 ** 40) & 0x3),
                (value / 2 ** 32) | 0,
                value >> 24,
                value >> 16,
                value >> 8,
                value,
            ]);
        case 7:
            return new Uint8Array([
                (1 << 1) | ((value / 2 ** 48) & 0x1),
                (value / 2 ** 40) | 0,
                (value / 2 ** 32) | 0,
                value >> 24,
                value >> 16,
                value >> 8,
                value,
            ]);
        case 8:
            return new Uint8Array([
                (1 << 0) | ((value / 2 ** 56) & 0x1),
                (value / 2 ** 48) | 0,
                (value / 2 ** 40) | 0,
                (value / 2 ** 32) | 0,
                value >> 24,
                value >> 16,
                value >> 8,
                value,
            ]);
        default:
            throw new Error('Bad EBML VINT size ' + width);
    }
};
exports.getVariableInt = getVariableInt;
const makeMatroskaBytes = (fields) => {
    if ('bytes' in fields) {
        return fields;
    }
    const value = makeFromStructure(fields);
    const header = (0, exports.matroskaToHex)((0, exports.getIdForName)(fields.type));
    const size = (0, exports.getVariableInt)(value.bytes.length, fields.minVintWidth);
    const bytes = (0, exports.combineUint8Arrays)([header, size, value.bytes]);
    return {
        bytes,
        offsets: {
            offset: value.offsets.offset,
            field: value.offsets.field,
            children: value.offsets.children.map((c) => {
                return (0, exports.incrementOffsetAndChildren)(c, header.byteLength + size.byteLength);
            }),
        },
    };
};
exports.makeMatroskaBytes = makeMatroskaBytes;
const padMatroskaBytes = (fields, totalLength) => {
    const regular = (0, exports.makeMatroskaBytes)(fields);
    const paddingLength = totalLength -
        regular.bytes.byteLength -
        (0, exports.matroskaToHex)(media_parser_1.MediaParserInternals.matroskaElements.Void).byteLength;
    if (paddingLength < 0) {
        throw new Error('ooops');
    }
    const padding = (0, exports.makeMatroskaBytes)({
        type: 'Void',
        value: new Uint8Array(paddingLength).fill(0),
        minVintWidth: null,
    });
    return [
        regular,
        {
            bytes: padding.bytes,
            offsets: (0, exports.incrementOffsetAndChildren)(padding.offsets, regular.bytes.length),
        },
    ];
};
exports.padMatroskaBytes = padMatroskaBytes;
function serializeUint16(value) {
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, value);
    return new Uint8Array(buffer);
}
