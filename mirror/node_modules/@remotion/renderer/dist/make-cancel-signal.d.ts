type Callback = () => void;
export type CancelSignal = (callback: Callback) => void;
export declare const makeCancelSignal: () => {
    cancelSignal: CancelSignal;
    cancel: () => void;
};
export declare const cancelErrorMessages: {
    renderMedia: string;
    renderFrames: string;
    renderStill: string;
    stitchFramesToVideo: string;
};
export declare const isUserCancelledRender: (err: unknown) => boolean;
export {};
