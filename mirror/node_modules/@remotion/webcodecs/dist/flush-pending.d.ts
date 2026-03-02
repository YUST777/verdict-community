export type FlushPending = {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
    promise: Promise<void>;
};
export declare const makeFlushPending: () => {
    promise: Promise<void>;
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
};
