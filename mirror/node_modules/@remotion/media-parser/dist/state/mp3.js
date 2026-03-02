"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMp3State = void 0;
const audio_sample_map_1 = require("./audio-sample-map");
const makeMp3State = () => {
    let mp3Info = null;
    let bitrateInfo = null;
    const audioSamples = (0, audio_sample_map_1.audioSampleMapState)();
    return {
        getMp3Info: () => mp3Info,
        setMp3Info: (info) => {
            mp3Info = info;
        },
        getMp3BitrateInfo: () => bitrateInfo,
        setMp3BitrateInfo: (info) => {
            bitrateInfo = info;
        },
        audioSamples,
    };
};
exports.makeMp3State = makeMp3State;
