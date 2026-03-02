import type { MediaParserAudioSample, MediaParserVideoSample } from './webcodec-sample-types';
export declare const convertAudioOrVideoSampleToWebCodecsTimestamps: <T extends MediaParserAudioSample | MediaParserVideoSample>({ sample, timescale, }: {
    sample: T;
    timescale: number;
}) => T;
