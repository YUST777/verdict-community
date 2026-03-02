export declare const renderPartitions: ({ frames, concurrency, }: {
    frames: number[];
    concurrency: number;
}) => {
    partitions: number[][];
    getNextFrame: (pageIndex: number) => number;
};
