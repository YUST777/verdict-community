import type { MediaParserOnVideoSample, MediaParserVideoTrack } from '@remotion/media-parser';
import type { ConvertMediaOnVideoFrame } from './convert-media';
import type { MediaFn } from './create/media-fn';
import type { VideoOperation } from './on-video-track-handler';
import type { ConvertMediaProgressFn } from './throttled-state-update';
import type { WebCodecsController } from './webcodecs-controller';
export declare const reencodeVideoTrack: ({ videoOperation, rotate, track, logLevel, abortConversion, onMediaStateUpdate, controller, onVideoFrame, state, progressTracker, }: {
    videoOperation: VideoOperation;
    rotate: number;
    track: MediaParserVideoTrack;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    abortConversion: (errCause: Error) => void;
    onMediaStateUpdate: ConvertMediaProgressFn | null;
    controller: WebCodecsController;
    onVideoFrame: ConvertMediaOnVideoFrame | null;
    state: MediaFn;
    progressTracker: {
        registerTrack: (trackNumber: number) => void;
        getSmallestProgress: () => number;
        updateTrackProgress: (trackNumber: number, progress: number) => void;
        setPossibleLowestTimestamp: (timestamp: number) => void;
    };
}) => Promise<MediaParserOnVideoSample | null>;
