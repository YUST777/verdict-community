"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartialWaveData = void 0;
const fetch_with_cors_catch_1 = require("./fetch-with-cors-catch");
const probe_wave_file_1 = require("./probe-wave-file");
const getPartialWaveData = async ({ dataOffset, src, bitsPerSample, channelIndex, sampleRate, fromSeconds, toSeconds, blockAlign, fileSize, signal, }) => {
    const startByte = dataOffset + Math.floor(fromSeconds * sampleRate) * blockAlign;
    const endByte = Math.min(fileSize, (dataOffset + Math.floor(toSeconds * sampleRate)) * blockAlign) - 1;
    const response = await (0, fetch_with_cors_catch_1.fetchWithCorsCatch)(src, {
        headers: {
            range: `bytes=${startByte}-${endByte}`,
        },
        signal,
    });
    if (response.status === 416) {
        throw new Error(`Tried to read bytes ${startByte}-${endByte} from ${src}, but the response status code was 416 "Range Not Satisfiable". Were too many bytes requested? The file is ${fileSize} bytes long.`);
    }
    if (response.status !== 206) {
        throw new Error(`Tried to read bytes ${startByte}-${endByte} from ${src}, but the response status code was ${response.status} (expected was 206). This means the server might not support returning a partial response.`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uintArray = new Uint8Array(arrayBuffer);
    const samples = new Float32Array(uintArray.length / blockAlign);
    for (let i = 0; i < uintArray.length; i += blockAlign) {
        const sampleStart = i + channelIndex * (bitsPerSample / 8);
        let sample;
        if (bitsPerSample === 16) {
            sample = (0, probe_wave_file_1.getInt16AsFloat)(uintArray, sampleStart);
        }
        else if (bitsPerSample === 8) {
            sample = (0, probe_wave_file_1.getInt8AsFloat)(uintArray, sampleStart);
        }
        else {
            throw new Error(`Unsupported bits per sample: ${bitsPerSample}`);
        }
        samples[i / blockAlign] = sample;
    }
    return samples;
};
exports.getPartialWaveData = getPartialWaveData;
