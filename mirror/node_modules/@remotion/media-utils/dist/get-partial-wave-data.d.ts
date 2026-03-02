export declare const getPartialWaveData: ({ dataOffset, src, bitsPerSample, channelIndex, sampleRate, fromSeconds, toSeconds, blockAlign, fileSize, signal, }: {
    dataOffset: number;
    src: string;
    bitsPerSample: number;
    channelIndex: number;
    sampleRate: number;
    fromSeconds: number;
    toSeconds: number;
    blockAlign: number;
    fileSize: number;
    signal: AbortSignal;
}) => Promise<Float32Array<ArrayBuffer>>;
