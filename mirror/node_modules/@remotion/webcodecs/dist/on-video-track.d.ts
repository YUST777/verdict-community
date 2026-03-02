import type { MediaParserOnVideoTrack } from '@remotion/media-parser';
import type { ConvertMediaOnVideoFrame } from './convert-media';
import type { MediaFn } from './create/media-fn';
import type { ConvertMediaOnVideoTrackHandler } from './on-video-track-handler';
import type { ResizeOperation } from './resizing/mode';
import type { ConvertMediaProgressFn } from './throttled-state-update';
import type { WebCodecsController } from './webcodecs-controller';
export declare const makeVideoTrackHandler: ({ state, onVideoFrame, onMediaStateUpdate, abortConversion, controller, defaultVideoCodec, onVideoTrack, logLevel, outputContainer, rotate, resizeOperation, progressTracker, }: {
    state: MediaFn;
    onVideoFrame: ConvertMediaOnVideoFrame | null;
    onMediaStateUpdate: ConvertMediaProgressFn | null;
    abortConversion: (errCause: Error) => void;
    controller: WebCodecsController;
    defaultVideoCodec: "h264" | "h265" | "vp8" | "vp9" | null;
    onVideoTrack: ConvertMediaOnVideoTrackHandler | null;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    outputContainer: "mp4" | "wav" | "webm";
    rotate: number;
    resizeOperation: ResizeOperation | null;
    progressTracker: {
        registerTrack: (trackNumber: number) => void;
        getSmallestProgress: () => number;
        updateTrackProgress: (trackNumber: number, progress: number) => void;
        setPossibleLowestTimestamp: (timestamp: number) => void;
    };
}) => MediaParserOnVideoTrack;
