"use strict";
// If an audio is of type, LPCM, the data structure will include 44100-48000 samples per second
// We need to handle this case differently and treat each chunk as a sample instead
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupedSamplesPositionsFromMp4 = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
// example video: mehmet.mov
const getGroupedSamplesPositionsFromMp4 = ({ trakBox, bigEndian, }) => {
    const stscBox = (0, traversal_1.getStscBox)(trakBox);
    const stszBox = (0, traversal_1.getStszBox)(trakBox);
    const stcoBox = (0, traversal_1.getStcoBox)(trakBox);
    if (!stscBox) {
        throw new Error('Expected stsc box in trak box');
    }
    if (!stcoBox) {
        throw new Error('Expected stco box in trak box');
    }
    if (!stszBox) {
        throw new Error('Expected stsz box in trak box');
    }
    if (stszBox.countType !== 'fixed') {
        throw new Error('Only supporting fixed count type in stsz box');
    }
    const samples = [];
    let timestamp = 0;
    const stscKeys = Array.from(stscBox.entries.keys());
    for (let i = 0; i < stcoBox.entries.length; i++) {
        const entry = stcoBox.entries[i];
        const chunk = i + 1;
        const stscEntry = stscKeys.findLast((e) => e <= chunk);
        if (stscEntry === undefined) {
            throw new Error('should not be');
        }
        const samplesPerChunk = stscBox.entries.get(stscEntry);
        if (samplesPerChunk === undefined) {
            throw new Error('should not be');
        }
        samples.push({
            chunk,
            timestamp,
            decodingTimestamp: timestamp,
            offset: Number(entry),
            size: stszBox.sampleSize * samplesPerChunk,
            duration: samplesPerChunk,
            isKeyframe: true,
            bigEndian,
            chunkSize: stszBox.sampleSize,
        });
        timestamp += samplesPerChunk;
    }
    return samples;
};
exports.getGroupedSamplesPositionsFromMp4 = getGroupedSamplesPositionsFromMp4;
