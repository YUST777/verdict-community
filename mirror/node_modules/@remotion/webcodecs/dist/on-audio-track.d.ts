import { type MediaParserOnAudioTrack } from '@remotion/media-parser';
import type { ConvertMediaOnAudioData } from './convert-media';
import type { MediaFn } from './create/media-fn';
import type { ConvertMediaOnAudioTrackHandler } from './on-audio-track-handler';
import type { ConvertMediaProgressFn } from './throttled-state-update';
import type { WebCodecsController } from './webcodecs-controller';
export declare const makeAudioTrackHandler: ({ state, defaultAudioCodec: audioCodec, controller, abortConversion, onMediaStateUpdate, onAudioTrack, logLevel, outputContainer, onAudioData, progressTracker, }: {
    state: MediaFn;
    defaultAudioCodec: "aac" | "opus" | "wav" | null;
    controller: WebCodecsController;
    abortConversion: (errCause: Error) => void;
    onMediaStateUpdate: ConvertMediaProgressFn | null;
    onAudioTrack: ConvertMediaOnAudioTrackHandler | null;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    outputContainer: "mp4" | "wav" | "webm";
    onAudioData: ConvertMediaOnAudioData | null;
    progressTracker: {
        registerTrack: (trackNumber: number) => void;
        getSmallestProgress: () => number;
        updateTrackProgress: (trackNumber: number, progress: number) => void;
        setPossibleLowestTimestamp: (timestamp: number) => void;
    };
}) => MediaParserOnAudioTrack;
