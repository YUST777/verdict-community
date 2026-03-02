export type SampleOutputRange = 'minus-one-to-one' | 'zero-to-one';
export declare const getWaveformSamples: ({ audioBuffer, numberOfSamples, outputRange, normalize, }: {
    audioBuffer: Float32Array<ArrayBufferLike>;
    numberOfSamples: number;
    outputRange: SampleOutputRange;
    normalize: boolean;
}) => number[];
