"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpsAndPps = void 0;
const getSpsAndPps = (infos) => {
    const avcProfile = infos.find((i) => i.type === 'avc-profile');
    const ppsProfile = infos.find((i) => i.type === 'avc-pps');
    if (!avcProfile || !ppsProfile) {
        throw new Error('Expected avcProfile and ppsProfile');
    }
    return { pps: ppsProfile, sps: avcProfile };
};
exports.getSpsAndPps = getSpsAndPps;
