import type { MediaParserLogLevel } from '../../log';
import type { MediaParserAudioSample, MediaParserOnAudioSample, MediaParserOnVideoSample, MediaParserVideoSample } from '../../webcodec-sample-types';
export declare const sampleSorter: ({ logLevel, getAllChunksProcessedForPlaylist, }: {
    logLevel: MediaParserLogLevel;
    getAllChunksProcessedForPlaylist: (src: string) => boolean;
}) => {
    clearSamples: () => void;
    addToStreamWithTrack: (src: string) => void;
    addVideoStreamToConsider: (src: string, callback: MediaParserOnVideoSample) => void;
    addAudioStreamToConsider: (src: string, callback: MediaParserOnAudioSample) => void;
    hasAudioStreamToConsider: (src: string) => boolean;
    hasVideoStreamToConsider: (src: string) => boolean;
    addAudioSample: (src: string, sample: MediaParserAudioSample) => Promise<void>;
    addVideoSample: (src: string, sample: MediaParserVideoSample) => Promise<void>;
    getNextStreamToRun: (streams: string[]) => string;
};
