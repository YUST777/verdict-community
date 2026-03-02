"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStreamPayloadMessage = exports.makeStreamer = exports.streamingKey = void 0;
exports.streamingKey = 'remotion_buffer:';
const makeStreamer = (onMessage) => {
    const separator = new Uint8Array(exports.streamingKey.length);
    for (let i = 0; i < exports.streamingKey.length; i++) {
        separator[i] = exports.streamingKey.charCodeAt(i);
    }
    let unprocessedBuffers = [];
    let outputBuffer = new Uint8Array(0);
    let missingData = null;
    const findSeparatorIndex = () => {
        let searchIndex = 0;
        while (true) {
            const separatorIndex = outputBuffer.indexOf(separator[0], searchIndex); // Start checking for the first byte of the separator
            if (separatorIndex === -1) {
                return -1;
            }
            if (outputBuffer
                .subarray(separatorIndex, separatorIndex + separator.length)
                .toString() !== separator.toString()) {
                searchIndex = separatorIndex + 1;
                continue;
            }
            return separatorIndex;
        }
    };
    const processInput = () => {
        let separatorIndex = findSeparatorIndex(); // Start checking for the first byte of the separator
        if (separatorIndex === -1) {
            return;
        }
        separatorIndex += separator.length;
        let nonceString = '';
        let lengthString = '';
        let statusString = '';
        while (true) {
            if (separatorIndex > outputBuffer.length - 1) {
                return;
            }
            const nextDigit = outputBuffer[separatorIndex];
            separatorIndex++;
            if (nextDigit === 0x3a) {
                break;
            }
            nonceString += String.fromCharCode(nextDigit);
        }
        while (true) {
            if (separatorIndex > outputBuffer.length - 1) {
                return;
            }
            const nextDigit = outputBuffer[separatorIndex];
            separatorIndex++;
            if (nextDigit === 0x3a) {
                break;
            }
            lengthString += String.fromCharCode(nextDigit);
        }
        while (true) {
            if (separatorIndex > outputBuffer.length - 1) {
                return;
            }
            const nextDigit = outputBuffer[separatorIndex];
            if (nextDigit === 0x3a) {
                break;
            }
            separatorIndex++;
            statusString += String.fromCharCode(nextDigit);
        }
        const length = Number(lengthString);
        const status = Number(statusString);
        const dataLength = outputBuffer.length - separatorIndex - 1;
        if (dataLength < length) {
            missingData = {
                dataMissing: length - dataLength,
            };
            return;
        }
        const data = outputBuffer.subarray(separatorIndex + 1, separatorIndex + 1 + Number(lengthString));
        onMessage(status === 1 ? 'error' : 'success', nonceString, data);
        missingData = null;
        outputBuffer = outputBuffer.subarray(separatorIndex + Number(lengthString) + 1);
        processInput();
    };
    const onData = (data) => {
        unprocessedBuffers.push(data);
        if (missingData) {
            missingData.dataMissing -= data.length;
        }
        if (missingData && missingData.dataMissing > 0) {
            return;
        }
        const newBuffer = new Uint8Array(outputBuffer.length +
            unprocessedBuffers.reduce((acc, val) => acc + val.length, 0));
        newBuffer.set(outputBuffer, 0);
        let offset = outputBuffer.length;
        for (const buf of unprocessedBuffers) {
            newBuffer.set(buf, offset);
            offset += buf.length;
        }
        outputBuffer = newBuffer;
        unprocessedBuffers = [];
        processInput();
    };
    return {
        onData,
        getOutputBuffer: () => outputBuffer,
        clear: () => {
            unprocessedBuffers = [];
            outputBuffer = new Uint8Array(0);
        },
    };
};
exports.makeStreamer = makeStreamer;
const makeStreamPayloadMessage = ({ status, body, nonce, }) => {
    const nonceArr = new TextEncoder().encode(nonce);
    const magicWordArr = new TextEncoder().encode(exports.streamingKey);
    const separatorArr = new TextEncoder().encode(':');
    const bodyLengthArr = new TextEncoder().encode(body.length.toString());
    const statusArr = new TextEncoder().encode(String(status));
    // Calculate total length of new Uint8Array
    const totalLength = nonceArr.length +
        magicWordArr.length +
        separatorArr.length * 3 +
        bodyLengthArr.length +
        statusArr.length +
        body.length;
    // Create a new Uint8Array to hold all combined parts
    const concat = new Uint8Array(totalLength);
    let offset = 0;
    // Function to append data to concat
    const appendToConcat = (data) => {
        concat.set(data, offset);
        offset += data.length;
    };
    // Building the final Uint8Array
    appendToConcat(magicWordArr);
    appendToConcat(nonceArr);
    appendToConcat(separatorArr);
    appendToConcat(bodyLengthArr);
    appendToConcat(separatorArr);
    appendToConcat(statusArr);
    appendToConcat(separatorArr);
    appendToConcat(body);
    return concat;
};
exports.makeStreamPayloadMessage = makeStreamPayloadMessage;
