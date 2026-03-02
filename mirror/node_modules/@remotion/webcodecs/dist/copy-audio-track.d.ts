import type { MediaParserAudioTrack, MediaParserOnAudioSample } from '@remotion/media-parser';
import type { MediaFn } from './create/media-fn';
import type { ConvertMediaProgressFn } from './throttled-state-update';
export declare const copyAudioTrack: ({ state, track, logLevel, onMediaStateUpdate, progressTracker, }: {
    state: MediaFn;
    track: MediaParserAudioTrack;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    onMediaStateUpdate: ConvertMediaProgressFn | null;
    progressTracker: {
        registerTrack: (trackNumber: number) => void;
        getSmallestProgress: () => number;
        updateTrackProgress: (trackNumber: number, progress: number) => void;
        setPossibleLowestTimestamp: (timestamp: number) => void;
    };
}) => Promise<MediaParserOnAudioSample>;
