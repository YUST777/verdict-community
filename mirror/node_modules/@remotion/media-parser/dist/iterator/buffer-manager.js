"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferManager = void 0;
const log_1 = require("../log");
const polyfilled_arraybuffer_1 = require("./polyfilled-arraybuffer");
const makeBufferWithMaxBytes = (initialData, maxBytes) => {
    const maxByteLength = Math.min(maxBytes, 2 ** 31);
    try {
        const buf = new ArrayBuffer(initialData.byteLength, {
            maxByteLength,
        });
        return new polyfilled_arraybuffer_1.ResizableBuffer(buf);
    }
    catch (e) {
        // Cloudflare Workers have a limit of 128MB max array buffer size
        if (e instanceof RangeError && maxBytes > 2 ** 27) {
            return new polyfilled_arraybuffer_1.ResizableBuffer(new ArrayBuffer(initialData.byteLength, {
                maxByteLength: 2 ** 27,
            }));
        }
        throw e;
    }
};
const bufferManager = ({ initialData, maxBytes, counter, logLevel, }) => {
    const buf = makeBufferWithMaxBytes(initialData, maxBytes);
    if (!buf.buffer.resize) {
        log_1.Log.warn(logLevel, '`ArrayBuffer.resize` is not supported in this Runtime. Using slow polyfill.');
    }
    buf.uintarray.set(initialData);
    let view = new DataView(buf.uintarray.buffer);
    const destroy = () => {
        buf.uintarray = new Uint8Array(0);
        buf.resize(0);
    };
    const flushBytesRead = (force, mode) => {
        const bytesToRemove = counter.getDiscardedOffset();
        // Only do this operation if it is really worth it 😇
        // let's set the threshold to 3MB
        if (bytesToRemove < 3000000 && !force) {
            return { bytesRemoved: 0, removedData: null };
        }
        // Don't remove if the data is not even available
        if (view.byteLength < bytesToRemove && !force) {
            return { bytesRemoved: 0, removedData: null };
        }
        counter.discardBytes(bytesToRemove);
        const removedData = mode === 'download' ? buf.uintarray.slice(0, bytesToRemove) : null;
        const newData = buf.uintarray.slice(bytesToRemove);
        buf.uintarray.set(newData);
        buf.resize(newData.byteLength);
        view = new DataView(buf.uintarray.buffer);
        return { bytesRemoved: bytesToRemove, removedData };
    };
    const skipTo = (offset) => {
        const becomesSmaller = offset < counter.getOffset();
        if (becomesSmaller) {
            const toDecrement = counter.getOffset() - offset;
            if (toDecrement > counter.getDiscardedOffset()) {
                throw new Error('Cannot count backwards, data has already been flushed');
            }
            counter.decrement(toDecrement);
        }
        const currentOffset = counter.getOffset();
        counter.increment(offset - currentOffset);
    };
    const addData = (newData) => {
        const oldLength = buf.buffer.byteLength;
        const newLength = oldLength + newData.byteLength;
        if (newLength < oldLength) {
            throw new Error('Cannot decrement size');
        }
        if (newLength > (maxBytes !== null && maxBytes !== void 0 ? maxBytes : Infinity)) {
            throw new Error(`Exceeded maximum byte length ${maxBytes} with ${newLength}`);
        }
        buf.resize(newLength);
        buf.uintarray = new Uint8Array(buf.buffer);
        buf.uintarray.set(newData, oldLength);
        view = new DataView(buf.uintarray.buffer);
    };
    const replaceData = (newData, seekTo) => {
        buf.resize(newData.byteLength);
        buf.uintarray = new Uint8Array(buf.buffer);
        buf.uintarray.set(newData);
        view = new DataView(buf.uintarray.buffer);
        counter.setDiscardedOffset(seekTo);
        // reset counter to 0
        counter.decrement(counter.getOffset());
        // seek to the new position
        counter.increment(seekTo);
    };
    return {
        getView: () => view,
        getUint8Array: () => buf.uintarray,
        destroy,
        addData,
        skipTo,
        removeBytesRead: flushBytesRead,
        replaceData,
    };
};
exports.bufferManager = bufferManager;
