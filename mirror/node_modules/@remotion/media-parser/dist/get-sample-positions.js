"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSamplePositions = void 0;
const getSamplePositions = ({ stcoBox, stszBox, stscBox, stssBox, sttsBox, cttsBox, }) => {
    var _a;
    const sttsDeltas = [];
    for (const distribution of sttsBox.sampleDistribution) {
        for (let i = 0; i < distribution.sampleCount; i++) {
            sttsDeltas.push(distribution.sampleDelta);
        }
    }
    const cttsEntries = [];
    for (const entry of (_a = cttsBox === null || cttsBox === void 0 ? void 0 : cttsBox.entries) !== null && _a !== void 0 ? _a : [
        { sampleCount: sttsDeltas.length, sampleOffset: 0 },
    ]) {
        for (let i = 0; i < entry.sampleCount; i++) {
            cttsEntries.push(entry.sampleOffset);
        }
    }
    let dts = 0;
    const chunks = stcoBox.entries;
    const samples = [];
    let samplesPerChunk = 1;
    for (let i = 0; i < chunks.length; i++) {
        const hasEntry = stscBox.entries.get(i + 1);
        if (hasEntry !== undefined) {
            samplesPerChunk = hasEntry;
        }
        let offsetInThisChunk = 0;
        for (let j = 0; j < samplesPerChunk; j++) {
            const size = stszBox.countType === 'fixed'
                ? stszBox.sampleSize
                : stszBox.entries[samples.length];
            const isKeyframe = stssBox
                ? stssBox.sampleNumber.has(samples.length + 1)
                : true;
            const delta = sttsDeltas[samples.length];
            const ctsOffset = cttsEntries[samples.length];
            const cts = dts + ctsOffset;
            samples.push({
                offset: Number(chunks[i]) + offsetInThisChunk,
                size,
                isKeyframe,
                decodingTimestamp: dts,
                timestamp: cts,
                duration: delta,
                chunk: i,
                bigEndian: false,
                chunkSize: null,
            });
            dts += delta;
            offsetInThisChunk += size;
        }
    }
    return samples;
};
exports.getSamplePositions = getSamplePositions;
