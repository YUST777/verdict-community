"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSamplesFromMoof = void 0;
const traversal_1 = require("./containers/iso-base-media/traversal");
const getSamplesFromTraf = (trafSegment, moofOffset, trexBoxes) => {
    var _a, _b, _c, _d, _e, _f;
    if (trafSegment.type !== 'regular-box' || trafSegment.boxType !== 'traf') {
        throw new Error('Expected traf-box');
    }
    const tfhdBox = (0, traversal_1.getTfhdBox)(trafSegment);
    const trexBox = (_a = trexBoxes.find((t) => t.trackId === (tfhdBox === null || tfhdBox === void 0 ? void 0 : tfhdBox.trackId))) !== null && _a !== void 0 ? _a : null;
    // intentional || instead of ?? to allow for 0, doesn't make sense for duration or size
    const defaultTrackSampleDuration = (tfhdBox === null || tfhdBox === void 0 ? void 0 : tfhdBox.defaultSampleDuration) || (trexBox === null || trexBox === void 0 ? void 0 : trexBox.defaultSampleDuration) || null;
    const defaultTrackSampleSize = (tfhdBox === null || tfhdBox === void 0 ? void 0 : tfhdBox.defaultSampleSize) || (trexBox === null || trexBox === void 0 ? void 0 : trexBox.defaultSampleSize) || null;
    // but flags may just be 0 :)
    const defaultTrackSampleFlags = (_c = (_b = tfhdBox === null || tfhdBox === void 0 ? void 0 : tfhdBox.defaultSampleFlags) !== null && _b !== void 0 ? _b : trexBox === null || trexBox === void 0 ? void 0 : trexBox.defaultSampleFlags) !== null && _c !== void 0 ? _c : null;
    const tfdtBox = (0, traversal_1.getTfdtBox)(trafSegment);
    const trunBoxes = (0, traversal_1.getTrunBoxes)(trafSegment);
    let time = 0;
    let offset = 0;
    let dataOffset = 0;
    const samples = [];
    for (const trunBox of trunBoxes) {
        let i = -1;
        if (trunBox.dataOffset) {
            dataOffset = trunBox.dataOffset;
            offset = 0;
        }
        for (const sample of trunBox.samples) {
            i++;
            const duration = sample.sampleDuration || defaultTrackSampleDuration;
            if (duration === null) {
                throw new Error('Expected duration');
            }
            const size = (_d = sample.sampleSize) !== null && _d !== void 0 ? _d : defaultTrackSampleSize;
            if (size === null) {
                throw new Error('Expected size');
            }
            const isFirstSample = i === 0;
            const sampleFlags = sample.sampleFlags
                ? sample.sampleFlags
                : isFirstSample && trunBox.firstSampleFlags !== null
                    ? trunBox.firstSampleFlags
                    : defaultTrackSampleFlags;
            if (sampleFlags === null) {
                throw new Error('Expected sample flags');
            }
            const keyframe = !((sampleFlags >> 16) & 0x1);
            const dts = time + ((_e = tfdtBox === null || tfdtBox === void 0 ? void 0 : tfdtBox.baseMediaDecodeTime) !== null && _e !== void 0 ? _e : 0);
            const samplePosition = {
                offset: offset + (moofOffset !== null && moofOffset !== void 0 ? moofOffset : 0) + (dataOffset !== null && dataOffset !== void 0 ? dataOffset : 0),
                decodingTimestamp: dts,
                timestamp: dts + ((_f = sample.sampleCompositionTimeOffset) !== null && _f !== void 0 ? _f : 0),
                duration,
                isKeyframe: keyframe,
                size,
                chunk: 0,
                bigEndian: false,
                chunkSize: null,
            };
            samples.push(samplePosition);
            offset += size;
            time += duration;
        }
    }
    return samples;
};
const getSamplesFromMoof = ({ moofBox, trackId, trexBoxes, }) => {
    const mapped = moofBox.trafBoxes.map((traf) => {
        const tfhdBox = (0, traversal_1.getTfhdBox)(traf);
        if (!tfhdBox || tfhdBox.trackId !== trackId) {
            return [];
        }
        return getSamplesFromTraf(traf, moofBox.offset, trexBoxes);
    });
    return mapped.flat(1);
};
exports.getSamplesFromMoof = getSamplesFromMoof;
