"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeInlineAudioMixing = void 0;
const node_fs_1 = __importStar(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const delete_directory_1 = require("../delete-directory");
const sample_rate_1 = require("../sample-rate");
const apply_tone_frequency_1 = require("./apply-tone-frequency");
const download_map_1 = require("./download-map");
const numberTo32BiIntLittleEndian = (num) => {
    return new Uint8Array([
        num & 0xff,
        (num >> 8) & 0xff,
        (num >> 16) & 0xff,
        (num >> 24) & 0xff,
    ]);
};
const numberTo16BitLittleEndian = (num) => {
    return new Uint8Array([num & 0xff, (num >> 8) & 0xff]);
};
/**
 * When multiplying seconds by sample rate, floating point errors can cause
 * results like 244799.99999999997 instead of 244800 (5.1 * 48000).
 * This snaps to the nearest integer when within tolerance,
 * preventing Math.floor/Math.ceil from rounding incorrectly.
 */
const correctFloatingPointError = (value) => {
    const rounded = Math.round(value);
    if (Math.abs(value - rounded) < 0.00001) {
        return rounded;
    }
    return value;
};
const BIT_DEPTH = 16;
const BYTES_PER_SAMPLE = BIT_DEPTH / 8;
const NUMBER_OF_CHANNELS = 2;
const makeInlineAudioMixing = (dir) => {
    const folderToAdd = (0, download_map_1.makeAndReturn)(dir, 'remotion-inline-audio-mixing');
    // asset id -> file descriptor
    const openFiles = {};
    const writtenHeaders = {};
    const toneFrequencies = {};
    const cleanup = () => {
        for (const fd of Object.values(openFiles)) {
            try {
                node_fs_1.default.closeSync(fd);
            }
            catch (_a) { }
        }
        (0, delete_directory_1.deleteDirectory)(folderToAdd);
    };
    const getListOfAssets = () => {
        return Object.keys(openFiles);
    };
    const getFilePath = (asset) => {
        return node_path_1.default.join(folderToAdd, `${asset.id}.wav`);
    };
    const ensureAsset = ({ asset, fps, totalNumberOfFrames, trimLeftOffset, trimRightOffset, }) => {
        const filePath = getFilePath(asset);
        if (!openFiles[filePath]) {
            openFiles[filePath] = node_fs_1.default.openSync(filePath, 'w');
        }
        if (writtenHeaders[filePath]) {
            return;
        }
        writtenHeaders[filePath] = true;
        const expectedDataSize = Math.round((totalNumberOfFrames / fps - trimLeftOffset + trimRightOffset) *
            NUMBER_OF_CHANNELS *
            sample_rate_1.DEFAULT_SAMPLE_RATE *
            BYTES_PER_SAMPLE);
        const expectedSize = 40 + expectedDataSize;
        const fd = openFiles[filePath];
        (0, node_fs_1.writeSync)(fd, new Uint8Array([0x52, 0x49, 0x46, 0x46]), 0, 4, 0); // "RIFF"
        (0, node_fs_1.writeSync)(fd, new Uint8Array(numberTo32BiIntLittleEndian(expectedSize)), 0, 4, 4); // Remaining size
        (0, node_fs_1.writeSync)(fd, new Uint8Array([0x57, 0x41, 0x56, 0x45]), 0, 4, 8); // "WAVE"
        (0, node_fs_1.writeSync)(fd, new Uint8Array([0x66, 0x6d, 0x74, 0x20]), 0, 4, 12); // "fmt "
        (0, node_fs_1.writeSync)(fd, new Uint8Array([BIT_DEPTH, 0x00, 0x00, 0x00]), 0, 4, 16); // fmt chunk size = 16
        (0, node_fs_1.writeSync)(fd, new Uint8Array([0x01, 0x00]), 0, 2, 20); // Audio format (PCM) = 1, set 3 if float32 would be true
        (0, node_fs_1.writeSync)(fd, new Uint8Array([NUMBER_OF_CHANNELS, 0x00]), 0, 2, 22); // Number of channels
        (0, node_fs_1.writeSync)(fd, new Uint8Array(numberTo32BiIntLittleEndian(sample_rate_1.DEFAULT_SAMPLE_RATE)), 0, 4, 24); // Sample rate
        (0, node_fs_1.writeSync)(fd, new Uint8Array(numberTo32BiIntLittleEndian(sample_rate_1.DEFAULT_SAMPLE_RATE * NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE)), 0, 4, 28); // Byte rate
        (0, node_fs_1.writeSync)(fd, new Uint8Array(numberTo16BitLittleEndian(NUMBER_OF_CHANNELS * BYTES_PER_SAMPLE)), 0, 2, 32); // Block align
        (0, node_fs_1.writeSync)(fd, numberTo16BitLittleEndian(BIT_DEPTH), 0, 2, 34); // Bits per sample
        (0, node_fs_1.writeSync)(fd, new Uint8Array([0x64, 0x61, 0x74, 0x61]), 0, 4, 36); // "data"
        (0, node_fs_1.writeSync)(fd, new Uint8Array(numberTo32BiIntLittleEndian(expectedDataSize)), 0, 4, 40); // Remaining size
    };
    const finish = async ({ binariesDirectory, indent, logLevel, cancelSignal, }) => {
        for (const fd of Object.keys(openFiles)) {
            const frequency = toneFrequencies[fd];
            if (frequency !== 1) {
                const tmpFile = fd.replace(/.wav$/, '-tmp.wav');
                await (0, apply_tone_frequency_1.applyToneFrequencyUsingFfmpeg)({
                    input: fd,
                    output: tmpFile,
                    toneFrequency: frequency,
                    indent,
                    logLevel,
                    binariesDirectory,
                    cancelSignal,
                });
                node_fs_1.default.renameSync(tmpFile, fd);
            }
        }
    };
    const addAsset = ({ asset, fps, totalNumberOfFrames, firstFrame, trimLeftOffset, trimRightOffset, }) => {
        ensureAsset({
            asset,
            fps,
            totalNumberOfFrames,
            trimLeftOffset,
            trimRightOffset,
        });
        const filePath = getFilePath(asset);
        if (toneFrequencies[filePath] !== undefined &&
            toneFrequencies[filePath] !== asset.toneFrequency) {
            throw new Error(`toneFrequency must be the same across the entire audio, got ${asset.toneFrequency}, but before it was ${toneFrequencies[filePath]}`);
        }
        const fileDescriptor = openFiles[filePath];
        toneFrequencies[filePath] = asset.toneFrequency;
        let arr = new Int16Array(asset.audio);
        const isFirst = asset.frame === firstFrame;
        const isLast = asset.frame === totalNumberOfFrames + firstFrame - 1;
        const samplesToShaveFromStart = trimLeftOffset * sample_rate_1.DEFAULT_SAMPLE_RATE;
        const samplesToShaveFromEnd = trimRightOffset * sample_rate_1.DEFAULT_SAMPLE_RATE;
        // Higher tolerance is needed for floating point videos
        // Rendering https://github.com/remotion-dev/remotion/pull/5920 in native frame rate
        // could hit this case
        if (isFirst) {
            arr = arr.slice(Math.floor(correctFloatingPointError(samplesToShaveFromStart)) *
                NUMBER_OF_CHANNELS);
        }
        if (isLast) {
            arr = arr.slice(0, arr.length +
                Math.ceil(correctFloatingPointError(samplesToShaveFromEnd)) *
                    NUMBER_OF_CHANNELS);
        }
        const positionInSeconds = (asset.frame - firstFrame) / fps - (isFirst ? 0 : trimLeftOffset);
        // Always rounding down to ensure there are no gaps when the samples don't align
        // In @remotion/media, we also round down the sample start timestamp and round up the end timestamp
        // This might lead to overlapping, hopefully aligning perfectly!
        // Test case: https://github.com/remotion-dev/remotion/issues/5758
        const position = Math.floor(correctFloatingPointError(positionInSeconds * sample_rate_1.DEFAULT_SAMPLE_RATE)) *
            NUMBER_OF_CHANNELS *
            BYTES_PER_SAMPLE;
        (0, node_fs_1.writeSync)(
        // fs
        fileDescriptor, 
        // data
        arr, 
        // offset of data
        0, 
        // length
        arr.byteLength, 
        // position
        44 + position);
    };
    return {
        cleanup,
        addAsset,
        getListOfAssets,
        finish,
    };
};
exports.makeInlineAudioMixing = makeInlineAudioMixing;
