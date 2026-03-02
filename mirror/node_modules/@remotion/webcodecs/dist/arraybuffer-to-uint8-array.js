"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayBufferToUint8Array = void 0;
const arrayBufferToUint8Array = (buffer) => {
    return buffer ? new Uint8Array(buffer) : null;
};
exports.arrayBufferToUint8Array = arrayBufferToUint8Array;
