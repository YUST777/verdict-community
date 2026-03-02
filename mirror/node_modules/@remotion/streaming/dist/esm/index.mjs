// src/make-stream-payload-message.ts
var magicWordStr = "remotion_buffer:";
var makeStreamPayloadMessage = ({
  status,
  body,
  nonce
}) => {
  const nonceArr = new TextEncoder().encode(nonce);
  const magicWordArr = new TextEncoder().encode(magicWordStr);
  const separatorArr = new TextEncoder().encode(":");
  const bodyLengthArr = new TextEncoder().encode(body.length.toString());
  const statusArr = new TextEncoder().encode(String(status));
  const totalLength = nonceArr.length + magicWordArr.length + separatorArr.length * 3 + bodyLengthArr.length + statusArr.length + body.length;
  const concat = new Uint8Array(totalLength);
  let offset = 0;
  const appendToConcat = (data) => {
    concat.set(data, offset);
    offset += data.length;
  };
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
// src/make-streamer.ts
var streamingKey = "remotion_buffer:";
var makeStreamer = (onMessage) => {
  const separator = new Uint8Array(streamingKey.length);
  for (let i = 0;i < streamingKey.length; i++) {
    separator[i] = streamingKey.charCodeAt(i);
  }
  let unprocessedBuffers = [];
  let outputBuffer = new Uint8Array(0);
  let missingData = null;
  const findSeparatorIndex = () => {
    let searchIndex = 0;
    while (true) {
      const separatorIndex = outputBuffer.indexOf(separator[0], searchIndex);
      if (separatorIndex === -1) {
        return -1;
      }
      if (outputBuffer.subarray(separatorIndex, separatorIndex + separator.length).toString() !== separator.toString()) {
        searchIndex = separatorIndex + 1;
        continue;
      }
      return separatorIndex;
    }
  };
  const processInput = () => {
    let separatorIndex = findSeparatorIndex();
    if (separatorIndex === -1) {
      return;
    }
    separatorIndex += separator.length;
    let nonceString = "";
    let lengthString = "";
    let statusString = "";
    while (true) {
      if (separatorIndex > outputBuffer.length - 1) {
        return;
      }
      const nextDigit = outputBuffer[separatorIndex];
      separatorIndex++;
      if (nextDigit === 58) {
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
      if (nextDigit === 58) {
        break;
      }
      lengthString += String.fromCharCode(nextDigit);
    }
    while (true) {
      if (separatorIndex > outputBuffer.length - 1) {
        return;
      }
      const nextDigit = outputBuffer[separatorIndex];
      if (nextDigit === 58) {
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
        dataMissing: length - dataLength
      };
      return;
    }
    const data = outputBuffer.subarray(separatorIndex + 1, separatorIndex + 1 + Number(lengthString));
    onMessage(status === 1 ? "error" : "success", nonceString, data);
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
    const newBuffer = new Uint8Array(outputBuffer.length + unprocessedBuffers.reduce((acc, val) => acc + val.length, 0));
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
    }
  };
};
export {
  makeStreamer,
  makeStreamPayloadMessage
};
