export declare const shouldUseParallelEncoding: ({ width, height, logLevel, }: {
    width: number;
    height: number;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
}) => {
    hasEnoughMemory: boolean;
    freeMemory: number;
    estimatedUsage: number;
};
