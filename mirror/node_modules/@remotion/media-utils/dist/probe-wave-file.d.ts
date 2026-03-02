export declare const getInt16AsFloat: (bytes: Uint8Array, offset: number) => number;
export declare const getInt8AsFloat: (bytes: Uint8Array, offset: number) => number;
export type WaveProbe = {
    dataOffset: number;
    bitsPerSample: number;
    numberOfChannels: number;
    sampleRate: number;
    blockAlign: number;
    fileSize: number;
    durationInSeconds: number;
};
export declare const probeWaveFile: (src: string, probeSize?: number) => Promise<WaveProbe>;
