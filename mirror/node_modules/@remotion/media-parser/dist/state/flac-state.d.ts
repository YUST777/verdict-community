export declare const flacState: () => {
    setBlockingBitStrategy: (strategy: number) => void;
    getBlockingBitStrategy: () => number | undefined;
    audioSamples: {
        addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
        getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
        setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
    };
};
export type FlacState = ReturnType<typeof flacState>;
