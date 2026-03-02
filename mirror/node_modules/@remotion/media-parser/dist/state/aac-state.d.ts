type AacSamplePosition = {
    offset: number;
    index: number;
    size: number;
};
export declare const aacState: () => {
    addSample: ({ offset, size }: {
        offset: number;
        size: number;
    }) => AacSamplePosition;
    getSamples: () => AacSamplePosition[];
    audioSamples: {
        addSample: (audioSampleOffset: import("./audio-sample-map").AudioSampleOffset) => void;
        getSamples: () => import("./audio-sample-map").AudioSampleOffset[];
        setFromSeekingHints: (newMap: import("./audio-sample-map").AudioSampleOffset[]) => void;
    };
};
export type AacState = ReturnType<typeof aacState>;
export {};
