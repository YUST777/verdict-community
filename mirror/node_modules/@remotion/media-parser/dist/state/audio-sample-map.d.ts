export type AudioSampleOffset = {
    timeInSeconds: number;
    offset: number;
    durationInSeconds: number;
};
export declare const audioSampleMapState: () => {
    addSample: (audioSampleOffset: AudioSampleOffset) => void;
    getSamples: () => AudioSampleOffset[];
    setFromSeekingHints: (newMap: AudioSampleOffset[]) => void;
};
export type AudioSampleMapState = ReturnType<typeof audioSampleMapState>;
