type Input = {
    timestamp: number;
};
type Output = {
    timestamp: number;
};
type Processed = {};
type Progress = {
    smallestProgress: number;
};
type IoEventMap = {
    input: Input;
    output: Output;
    processed: Processed;
    progress: Progress;
};
export type IoEventTypes = keyof IoEventMap;
export type CallbackListener<T extends IoEventTypes> = (data: {
    detail: IoEventMap[T];
}) => void;
type IoListeners = {
    [EventType in IoEventTypes]: CallbackListener<EventType>[];
};
export declare class IoEventEmitter {
    listeners: IoListeners;
    addEventListener<Q extends IoEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    removeEventListener<Q extends IoEventTypes>(name: Q, callback: CallbackListener<Q>): void;
    dispatchEvent<T extends IoEventTypes>(dispatchName: T, context: IoEventMap[T]): void;
}
export {};
