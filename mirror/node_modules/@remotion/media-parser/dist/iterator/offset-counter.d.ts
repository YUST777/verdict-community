export declare const makeOffsetCounter: (initial: number) => {
    getOffset: () => number;
    discardBytes: (bytes: number) => void;
    increment: (bytes: number) => void;
    getDiscardedBytes: () => number;
    setDiscardedOffset: (bytes: number) => void;
    getDiscardedOffset: () => number;
    decrement: (bytes: number) => void;
};
export type OffsetCounter = ReturnType<typeof makeOffsetCounter>;
