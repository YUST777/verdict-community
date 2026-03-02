import type { MediaParserAudioTrack, MediaParserOnAudioSample } from '@remotion/media-parser';
import type { ConvertMediaOnAudioData } from './convert-media';
import type { MediaFn } from './create/media-fn';
import type { AudioOperation } from './on-audio-track-handler';
import type { ConvertMediaProgressFn } from './throttled-state-update';
import type { WebCodecsController } from './webcodecs-controller';
export declare const reencodeAudioTrack: ({ audioOperation, track, logLevel, abortConversion, state, controller, onMediaStateUpdate, onAudioData, progressTracker, }: {
    audioOperation: AudioOperation;
    track: MediaParserAudioTrack;
    logLevel: "error" | "info" | "trace" | "verbose" | "warn";
    abortConversion: (errCause: Error) => void;
    state: MediaFn;
    controller: WebCodecsController;
    onMediaStateUpdate: ConvertMediaProgressFn | null;
    onAudioData: ConvertMediaOnAudioData | null;
    progressTracker: {
        registerTrack: (trackNumber: number) => void;
        getSmallestProgress: () => number;
        updateTrackProgress: (trackNumber: number, progress: number) => void;
        setPossibleLowestTimestamp: (timestamp: number) => void;
    };
}) => Promise<MediaParserOnAudioSample | null>;
