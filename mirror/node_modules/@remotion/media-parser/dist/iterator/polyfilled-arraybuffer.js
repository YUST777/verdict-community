"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizableBuffer = void 0;
class ResizableBuffer {
    constructor(buffer) {
        this.buffer = buffer;
        this.uintarray = new Uint8Array(buffer);
    }
    resize(newLength) {
        if (typeof this.buffer.resize === 'function') {
            this.buffer.resize(newLength);
        }
        else {
            const newBuffer = new ArrayBuffer(newLength);
            new Uint8Array(newBuffer).set(new Uint8Array(this.buffer).subarray(0, Math.min(this.buffer.byteLength, newLength)));
            this.buffer = newBuffer;
            this.uintarray = new Uint8Array(newBuffer);
        }
    }
}
exports.ResizableBuffer = ResizableBuffer;
