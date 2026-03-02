"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioSampleMapState = void 0;
const audioSampleMapState = () => {
    // {[]}
    let map = [];
    const addSample = (audioSampleOffset) => {
        if (map.find((m) => m.offset === audioSampleOffset.offset)) {
            return;
        }
        map.push(audioSampleOffset);
    };
    return {
        addSample,
        getSamples: () => map,
        setFromSeekingHints: (newMap) => {
            map = newMap;
        },
    };
};
exports.audioSampleMapState = audioSampleMapState;
