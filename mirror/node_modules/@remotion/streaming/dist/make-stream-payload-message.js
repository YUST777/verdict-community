"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeStreamPayloadMessage = exports.magicWordStr = void 0;
exports.magicWordStr = 'remotion_buffer:';
const makeStreamPayloadMessage = ({ status, body, nonce, }) => {
    const nonceArr = new TextEncoder().encode(nonce);
    const magicWordArr = new TextEncoder().encode(exports.magicWordStr);
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
