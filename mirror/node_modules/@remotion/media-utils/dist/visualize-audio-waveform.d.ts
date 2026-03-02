import type { MediaUtilsAudioData } from './types';
export type VisualizeAudioWaveformOptions = {
    audioData: MediaUtilsAudioData;
    frame: number;
    fps: number;
    windowInSeconds: number;
    numberOfSamples: number;
    channel?: number;
    dataOffsetInSeconds?: number;
    normalize?: boolean;
};
export declare const visualizeAudioWaveform: (parameters: VisualizeAudioWaveformOptions) => number[];
