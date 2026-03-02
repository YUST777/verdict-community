export declare const nextFrameToRenderState: ({ allFramesAndExtraFrames, concurrencyOrFramesToRender: _concurrency, }: {
    allFramesAndExtraFrames: number[];
    concurrencyOrFramesToRender: number;
}) => {
    getNextFrame: (_pageIndex: number) => number;
    returnFrame: (frame: number) => void;
};
type Fn = typeof nextFrameToRenderState;
export type NextFrameToRender = ReturnType<Fn>;
export declare const partitionedNextFrameToRenderState: Fn;
export {};
