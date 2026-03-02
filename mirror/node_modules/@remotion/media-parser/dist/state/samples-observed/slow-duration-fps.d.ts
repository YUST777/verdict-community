import type { MediaParserAudioSample, MediaParserVideoSample } from '../../webcodec-sample-types';
export declare const samplesObservedState: () => {
    addVideoSample: (videoSample: MediaParserVideoSample) => void;
    addAudioSample: (audioSample: MediaParserAudioSample) => void;
    getSlowDurationInSeconds: () => number;
    getFps: () => number;
    getSlowNumberOfFrames: () => number;
    getAudioBitrate: () => number | null;
    getVideoBitrate: () => number | null;
    getLastSampleObserved: () => boolean;
    setLastSampleObserved: () => void;
    getAmountOfSamplesObserved: () => number;
};
export type SamplesObservedState = ReturnType<typeof samplesObservedState>;
