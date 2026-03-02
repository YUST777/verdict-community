export declare const ptsStartOffsetStore: () => {
    getOffset: (trackId: number) => number;
    setOffset: ({ newOffset, trackId }: {
        trackId: number;
        newOffset: number;
    }) => void;
};
export type PtsStartOffsetState = ReturnType<typeof ptsStartOffsetStore>;
