import type { MediaUtilsAudioData } from './types';
export type UseWindowedAudioDataOptions = {
    src: string;
    frame: number;
    fps: number;
    windowInSeconds: number;
    channelIndex?: number;
};
export type UseWindowedAudioDataReturnValue = {
    audioData: MediaUtilsAudioData | null;
    dataOffsetInSeconds: number;
};
export declare const useWindowedAudioData: ({ src, frame, fps, windowInSeconds, channelIndex, }: UseWindowedAudioDataOptions) => UseWindowedAudioDataReturnValue;
