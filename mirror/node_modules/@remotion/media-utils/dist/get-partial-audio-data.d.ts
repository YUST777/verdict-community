import type { InputAudioTrack } from 'mediabunny';
export type GetPartialAudioDataProps = {
    track: InputAudioTrack;
    fromSeconds: number;
    toSeconds: number;
    channelIndex: number;
    signal: AbortSignal;
    isMatroska: boolean;
};
export declare const getPartialAudioData: ({ track, fromSeconds, toSeconds, channelIndex, signal, isMatroska, }: GetPartialAudioDataProps) => Promise<Float32Array<ArrayBufferLike>>;
