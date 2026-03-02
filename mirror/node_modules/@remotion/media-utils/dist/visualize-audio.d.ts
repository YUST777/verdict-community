import type { OptimizeFor } from './fft/get-visualization';
import type { MediaUtilsAudioData } from './types';
type MandatoryVisualizeAudioOptions = {
    audioData: MediaUtilsAudioData;
    frame: number;
    fps: number;
    numberOfSamples: number;
};
type OptionalVisualizeAudioOptions = {
    optimizeFor: OptimizeFor;
    dataOffsetInSeconds: number;
    smoothing: boolean;
};
export type VisualizeAudioOptions = MandatoryVisualizeAudioOptions & Partial<OptionalVisualizeAudioOptions>;
export declare const visualizeAudio: ({ smoothing, optimizeFor, dataOffsetInSeconds, ...parameters }: MandatoryVisualizeAudioOptions & Partial<OptionalVisualizeAudioOptions>) => number[];
export {};
