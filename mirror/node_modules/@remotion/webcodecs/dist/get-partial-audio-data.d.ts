export type GetPartialAudioDataProps = {
    src: string;
    fromSeconds: number;
    toSeconds: number;
    channelIndex: number;
    signal: AbortSignal;
};
export declare const getPartialAudioData: ({ src, fromSeconds, toSeconds, channelIndex, signal, }: GetPartialAudioDataProps) => Promise<Float32Array<ArrayBufferLike>>;
