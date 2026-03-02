export type OptimizeFor = 'accuracy' | 'speed';
export declare const getVisualization: ({ sampleSize, data, sampleRate, frame, fps, maxInt, optimizeFor, dataOffsetInSeconds, }: {
    sampleSize: number;
    data: Float32Array<ArrayBufferLike>;
    frame: number;
    sampleRate: number;
    fps: number;
    maxInt: number;
    optimizeFor: OptimizeFor;
    dataOffsetInSeconds: number;
}) => number[];
