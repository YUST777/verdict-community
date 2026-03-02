import type { MediaParserController } from '../controller/media-parser-controller';
import type { PrefetchCache } from '../fetch';
import type { MediaParserLogLevel } from '../log';
import type { ParseMediaSrc } from '../options';
import type { MediaParserReaderInterface } from '../readers/reader';
import type { SpsAndPps } from './parser-state';
type AvcProfileInfoCallback = (profile: SpsAndPps) => Promise<void>;
export declare const riffSpecificState: ({ controller, logLevel, readerInterface, src, prefetchCache, contentLength, }: {
    controller: MediaParserController;
    logLevel: MediaParserLogLevel;
    readerInterface: MediaParserReaderInterface;
    src: ParseMediaSrc;
    prefetchCache: PrefetchCache;
    contentLength: number;
}) => {
    getAvcProfile: () => SpsAndPps | null;
    onProfile: (profile: SpsAndPps) => Promise<void>;
    registerOnAvcProfileCallback: (callback: AvcProfileInfoCallback) => void;
    getNextTrackIndex: () => number;
    queuedBFrames: {
        addFrame: ({ frame, maxFramesInBuffer, trackId, timescale, }: {
            frame: import("./riff/queued-frames").QueuedVideoSample;
            trackId: number;
            maxFramesInBuffer: number;
            timescale: number;
        }) => void;
        flush: () => void;
        getReleasedFrame: () => {
            sample: import("./riff/queued-frames").QueuedVideoSample;
            trackId: number;
            timescale: number;
        } | null;
        hasReleasedFrames: () => boolean;
        clear: () => void;
    };
    incrementNextTrackIndex: () => void;
    lazyIdx1: {
        triggerLoad: (position: number) => Promise<{
            entries: import("../containers/riff/riff-box").Idx1Entry[];
            videoTrackIndex: number | null;
        }>;
        getLoadedIdx1: () => Promise<{
            entries: import("../containers/riff/riff-box").Idx1Entry[];
            videoTrackIndex: number | null;
        } | null>;
        getIfAlreadyLoaded: () => {
            entries: import("../containers/riff/riff-box").Idx1Entry[];
            videoTrackIndex: number | null;
        } | null;
        setFromSeekingHints: (hints: import("../containers/riff/seeking-hints").RiffSeekingHints) => void;
        waitForLoaded: () => Promise<{
            entries: import("../containers/riff/riff-box").Idx1Entry[];
            videoTrackIndex: number | null;
        }> | Promise<null>;
    };
    sampleCounter: {
        onAudioSample: (trackId: number, audioSample: import("..").MediaParserAudioSample) => void;
        onVideoSample: ({ trackId, videoSample, }: {
            videoSample: import("..").MediaParserVideoSample;
            trackId: number;
        }) => void;
        getSampleCountForTrack: ({ trackId }: {
            trackId: number;
        }) => number;
        setSamplesFromSeek: (samples: Record<number, number>) => void;
        riffKeys: {
            addKeyframe: (keyframe: import("./riff/riff-keyframes").RiffKeyframe) => void;
            getKeyframes: () => import("./riff/riff-keyframes").RiffKeyframe[];
            setFromSeekingHints: (keyframesFromHints: import("./riff/riff-keyframes").RiffKeyframe[]) => void;
        };
        setPocAtKeyframeOffset: ({ keyframeOffset, poc, }: {
            keyframeOffset: number;
            poc: number;
        }) => void;
        getPocAtKeyframeOffset: ({ keyframeOffset, }: {
            keyframeOffset: number;
        }) => number[];
        getKeyframeAtOffset: (sample: import("./riff/queued-frames").QueuedVideoSample) => number | null;
    };
};
export type RiffState = ReturnType<typeof riffSpecificState>;
export {};
