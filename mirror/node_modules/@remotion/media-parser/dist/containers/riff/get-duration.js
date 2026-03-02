"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSampleRateFromAvi = exports.getDurationFromAvi = void 0;
const traversal_1 = require("./traversal");
const getDurationFromAvi = (structure) => {
    const strl = (0, traversal_1.getStrlBoxes)(structure);
    const lengths = [];
    for (const s of strl) {
        const strh = (0, traversal_1.getStrhBox)(s.children);
        if (!strh) {
            throw new Error('No strh box');
        }
        const samplesPerSecond = strh.rate / strh.scale;
        const streamLength = strh.length / samplesPerSecond;
        lengths.push(streamLength);
    }
    return Math.max(...lengths);
};
exports.getDurationFromAvi = getDurationFromAvi;
const getSampleRateFromAvi = (structure) => {
    const strl = (0, traversal_1.getStrlBoxes)(structure);
    for (const s of strl) {
        const strh = (0, traversal_1.getStrhBox)(s.children);
        if (!strh) {
            throw new Error('No strh box');
        }
        if (strh.strf.type === 'strf-box-audio') {
            return strh.strf.sampleRate;
        }
    }
    return null;
};
exports.getSampleRateFromAvi = getSampleRateFromAvi;
