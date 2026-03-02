export declare const withResolvers: <T>() => {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};
export declare const withResolversAndWaitForReturn: <T>() => {
    getPromiseToImmediatelyReturn: () => Promise<T>;
    reject: (reason: unknown) => void;
    resolve: (value: T | PromiseLike<T>) => void;
};
