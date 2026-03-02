import type { M3uAssociatedPlaylist, M3uStream } from '../containers/m3u/get-streams';
import type { MediaParserLogLevel } from '../log';
import type { IsoBaseMediaStructure } from '../parse-result';
import type { MediaParserOnAudioSample, MediaParserOnVideoSample } from '../webcodec-sample-types';
export type M3uStreamOrInitialUrl = {
    type: 'selected-stream';
    stream: M3uStream;
} | {
    type: 'initial-url';
    url: string;
};
export type M3uRun = {
    continue: () => Promise<M3uRun | null>;
    abort: () => void;
};
type M3uSeek = {
    targetTime: number;
};
export declare const m3uState: (logLevel: MediaParserLogLevel) => {
    setSelectedMainPlaylist: (stream: M3uStreamOrInitialUrl) => void;
    getSelectedMainPlaylist: () => M3uStreamOrInitialUrl | null;
    setHasEmittedVideoTrack: (src: string, callback: MediaParserOnVideoSample | null) => void;
    hasEmittedVideoTrack: (src: string) => false | MediaParserOnVideoSample | null;
    setHasEmittedAudioTrack: (src: string, callback: MediaParserOnAudioSample | null) => void;
    hasEmittedAudioTrack: (src: string) => false | MediaParserOnAudioSample | null;
    setHasEmittedDoneWithTracks: (src: string) => void;
    hasEmittedDoneWithTracks: (src: string) => boolean;
    setReadyToIterateOverM3u: () => void;
    isReadyToIterateOverM3u: () => boolean;
    setAllChunksProcessed: (src: string) => void;
    clearAllChunksProcessed: () => void;
    getAllChunksProcessedForPlaylist: (src: string) => boolean;
    getAllChunksProcessedOverall: () => boolean;
    setHasFinishedManifest: () => void;
    hasFinishedManifest: () => boolean;
    setM3uStreamRun: (playlistUrl: string, run: M3uRun | null) => void;
    setTracksDone: (playlistUrl: string) => boolean;
    getTrackDone: (playlistUrl: string) => boolean;
    clearTracksDone: () => void;
    getM3uStreamRun: (playlistUrl: string) => M3uRun;
    abortM3UStreamRuns: () => void;
    setAssociatedPlaylists: (playlists: M3uAssociatedPlaylist[]) => void;
    getAssociatedPlaylists: () => M3uAssociatedPlaylist[] | null;
    getSelectedPlaylists: () => string[];
    sampleSorter: {
        clearSamples: () => void;
        addToStreamWithTrack: (src: string) => void;
        addVideoStreamToConsider: (src: string, callback: MediaParserOnVideoSample) => void;
        addAudioStreamToConsider: (src: string, callback: MediaParserOnAudioSample) => void;
        hasAudioStreamToConsider: (src: string) => boolean;
        hasVideoStreamToConsider: (src: string) => boolean;
        addAudioSample: (src: string, sample: import("../webcodec-sample-types").MediaParserAudioSample) => Promise<void>;
        addVideoSample: (src: string, sample: import("../webcodec-sample-types").MediaParserVideoSample) => Promise<void>;
        getNextStreamToRun: (streams: string[]) => string;
    };
    setMp4HeaderSegment: (playlistUrl: string, structure: IsoBaseMediaStructure) => void;
    getMp4HeaderSegment: (playlistUrl: string) => IsoBaseMediaStructure;
    setSeekToSecondsToProcess: (playlistUrl: string, m3uSeek: M3uSeek | null) => void;
    getSeekToSecondsToProcess: (playlistUrl: string) => M3uSeek | null;
    setNextSeekShouldSubtractChunks: (playlistUrl: string, chunks: number) => void;
    getNextSeekShouldSubtractChunks: (playlistUrl: string) => number;
};
export type M3uState = ReturnType<typeof m3uState>;
export {};
