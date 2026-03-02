type MediaParserEventMap = {
    pause: undefined;
    resume: undefined;
    abort: {
        reason?: unknown;
    };
    seek: {
        seek: number;
    };
};
export type MediaParserEventTypes = keyof MediaParserEventMap;
export type CallbackListener<T extends MediaParserEventTypes> = (data: {
    detail: MediaParserEventMap[T];
}) => void;
type MediaParserListeners = {
    [EventType in MediaParserEventTypes]: CallbackListener<EventType>[];
};
export declare class MediaParserEmitter {
    #private;
    listeners: MediaParserListeners;
    readyPromise: Promise<void>;
    constructor();
    markAsReady: () => void;
    addEventListener: <Q extends MediaParserEventTypes>(name: Q, callback: CallbackListener<Q>) => void;
    removeEventListener: <Q extends MediaParserEventTypes>(name: Q, callback: CallbackListener<Q>) => void;
    private dispatchEvent;
    dispatchPause: () => void;
    dispatchResume: () => void;
    dispatchAbort: (reason?: unknown) => void;
    dispatchSeek: (seek: number) => void;
}
export {};
