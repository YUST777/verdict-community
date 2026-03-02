import type { SampleOutputRange } from './get-wave-form-samples';
import type { MediaUtilsAudioData } from './types';
type Bar = {
    index: number;
    amplitude: number;
};
export type GetWaveformPortion = {
    audioData: MediaUtilsAudioData;
    startTimeInSeconds: number;
    durationInSeconds: number;
    numberOfSamples: number;
    channel?: number;
    outputRange?: SampleOutputRange;
    dataOffsetInSeconds?: number;
    normalize?: boolean;
};
export declare const getWaveformPortion: ({ audioData, startTimeInSeconds, durationInSeconds, numberOfSamples, channel, outputRange, dataOffsetInSeconds, normalize, }: GetWaveformPortion) => Bar[];
export { Bar };
