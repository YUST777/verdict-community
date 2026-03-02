export declare const seekInfiniteLoopDetectionState: () => {
    registerSeek: (byte: number) => void;
    reset: () => void;
};
export type SeekInfiniteLoop = ReturnType<typeof seekInfiniteLoopDetectionState>;
