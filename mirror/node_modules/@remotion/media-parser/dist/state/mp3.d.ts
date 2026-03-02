import type { XingData } from '../containers/mp3/parse-xing';
export type Mp3Info = {
    sampleRate: number;
    mpegVersion: 1 | 2;
    layer: number;
};
export type VariableMp3BitrateInfo = {
    type: 'variable';
    xingData: XingData;
};
export type Mp3BitrateInfo = {
    type: 'constant';
    bitrateInKbit: number;
} | VariableMp3BitrateInfo;
export declare const makeMp3State: () => {
    getMp3Info: () => Mp3Info | null;
    setMp3Info: (info: Mp3Info) => void;
    getMp3BitrateInfo: () => Mp3BitrateInfo | null;
    setMp3BitrateInfo: (info: Mp3BitrateInfo) => void;
    audioSamples: {
        addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
        getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
        setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
    };
};
export type Mp3State = ReturnType<typeof makeMp3State>;
