"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDENTITY_MATRIX = exports.padIsoBaseMediaBytes = exports.stringToPascalString = exports.serializeMatrix = exports.floatTo16Point16_16Bit = exports.floatTo16Point1632Bit = exports.addLeading128Size = exports.addSize = exports.setFixedPointSigned230Number = exports.setFixedPointSignedOrUnsigned1616Number = exports.numberTo16BitUIntOrInt = exports.numberTo32BitUIntOrIntLeading128 = exports.numberTo64BitUIntOrInt = exports.numberTo32BitUIntOrInt = exports.stringsToUint8Array = void 0;
const matroska_utils_1 = require("../matroska/matroska-utils");
const stringsToUint8Array = (str) => {
    return new TextEncoder().encode(str);
};
exports.stringsToUint8Array = stringsToUint8Array;
const numberTo32BitUIntOrInt = (num) => {
    return new Uint8Array([
        (num >> 24) & 0xff,
        (num >> 16) & 0xff,
        (num >> 8) & 0xff,
        num & 0xff,
    ]);
};
exports.numberTo32BitUIntOrInt = numberTo32BitUIntOrInt;
const numberTo64BitUIntOrInt = (num) => {
    const bigNum = BigInt(num);
    return new Uint8Array([
        Number((bigNum >> 56n) & 0xffn),
        Number((bigNum >> 48n) & 0xffn),
        Number((bigNum >> 40n) & 0xffn),
        Number((bigNum >> 32n) & 0xffn),
        Number((bigNum >> 24n) & 0xffn),
        Number((bigNum >> 16n) & 0xffn),
        Number((bigNum >> 8n) & 0xffn),
        Number(bigNum & 0xffn),
    ]);
};
exports.numberTo64BitUIntOrInt = numberTo64BitUIntOrInt;
const numberTo32BitUIntOrIntLeading128 = (num) => {
    const arr = [
        (num >> 24) & 0xff,
        (num >> 16) & 0xff,
        (num >> 8) & 0xff,
        num & 0xff,
    ];
    for (const i in arr) {
        if (arr[i] === 0) {
            arr[i] = 128;
        }
        else {
            break;
        }
    }
    return new Uint8Array(arr);
};
exports.numberTo32BitUIntOrIntLeading128 = numberTo32BitUIntOrIntLeading128;
const numberTo16BitUIntOrInt = (num) => {
    return new Uint8Array([(num >> 8) & 0xff, num & 0xff]);
};
exports.numberTo16BitUIntOrInt = numberTo16BitUIntOrInt;
const setFixedPointSignedOrUnsigned1616Number = (num) => {
    const val = Math.round(num * 2 ** 16);
    return (0, exports.numberTo32BitUIntOrInt)(val);
};
exports.setFixedPointSignedOrUnsigned1616Number = setFixedPointSignedOrUnsigned1616Number;
const setFixedPointSigned230Number = (num) => {
    const val = Math.round(num * 2 ** 30);
    return (0, exports.numberTo32BitUIntOrInt)(val);
};
exports.setFixedPointSigned230Number = setFixedPointSigned230Number;
const addSize = (arr) => {
    return (0, matroska_utils_1.combineUint8Arrays)([(0, exports.numberTo32BitUIntOrInt)(arr.length + 4), arr]);
};
exports.addSize = addSize;
const addLeading128Size = (arr) => {
    return (0, matroska_utils_1.combineUint8Arrays)([
        (0, exports.numberTo32BitUIntOrIntLeading128)(arr.length),
        arr,
    ]);
};
exports.addLeading128Size = addLeading128Size;
const floatTo16Point1632Bit = (number) => {
    // Ensure the number has exactly 2 decimal places
    const fixedNumber = Number(number.toFixed(2));
    // Create a new Uint8Array of 4 bytes
    const result = new Uint8Array(4);
    // Extract digits
    const tens = Math.floor(fixedNumber / 10);
    const ones = Math.floor(fixedNumber % 10);
    const tenths = Math.floor((fixedNumber * 10) % 10);
    const hundredths = Math.floor((fixedNumber * 100) % 10);
    // Assign to array
    result[0] = tens;
    result[1] = ones;
    result[2] = tenths;
    result[3] = hundredths;
    return result;
};
exports.floatTo16Point1632Bit = floatTo16Point1632Bit;
const floatTo16Point16_16Bit = (number) => {
    // Ensure the number has exactly 2 decimal places
    const fixedNumber = Number(number.toFixed(2));
    // Create a new Uint8Array of 4 bytes
    const result = new Uint8Array(2);
    // Extract digits
    const ones = Math.floor(fixedNumber % 10);
    const tenths = Math.floor((fixedNumber * 10) % 10);
    // Assign to array
    result[0] = ones;
    result[1] = tenths;
    return result;
};
exports.floatTo16Point16_16Bit = floatTo16Point16_16Bit;
const serializeMatrix = (matrix) => {
    return (0, matroska_utils_1.combineUint8Arrays)([
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[0]),
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[1]),
        (0, exports.setFixedPointSigned230Number)(matrix[2]),
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[3]),
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[4]),
        (0, exports.setFixedPointSigned230Number)(matrix[5]),
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[6]),
        (0, exports.setFixedPointSignedOrUnsigned1616Number)(matrix[7]),
        (0, exports.setFixedPointSigned230Number)(matrix[8]),
    ]);
};
exports.serializeMatrix = serializeMatrix;
const stringToPascalString = (str) => {
    // Create a fixed 32-byte Uint8Array
    const buffer = new Uint8Array(32);
    // Convert the string characters to bytes
    for (let i = 0; i < Math.min(str.length, 32); i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
};
exports.stringToPascalString = stringToPascalString;
const padIsoBaseMediaBytes = (data, totalLength) => {
    if (data.length - 8 > totalLength) {
        throw new Error(`Data is longer than the total length: ${data.length - 8} > ${totalLength}. Set the 'expectedDurationInSeconds' value to avoid this problem: https://www.remotion.dev/docs/webcodecs/convert-media#expecteddurationinseconds`);
    }
    if (data.length - 8 === totalLength) {
        return data;
    }
    return (0, matroska_utils_1.combineUint8Arrays)([
        data,
        (0, exports.addSize)((0, matroska_utils_1.combineUint8Arrays)([
            (0, exports.stringsToUint8Array)('free'),
            new Uint8Array(totalLength - (data.length - 8)),
        ])),
    ]);
};
exports.padIsoBaseMediaBytes = padIsoBaseMediaBytes;
exports.IDENTITY_MATRIX = [1, 0, 0, 0, 1, 0, 0, 0, 1];
