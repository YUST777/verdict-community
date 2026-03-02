import type { MediaParserAudioSample, MediaParserVideoSample } from '../../webcodec-sample-types';
export declare const lastEmittedSampleState: () => {
    setLastEmittedSample: (sample: MediaParserAudioSample | MediaParserVideoSample) => void;
    getLastEmittedSample: () => MediaParserVideoSample | MediaParserAudioSample | null;
    resetLastEmittedSample: () => void;
};
