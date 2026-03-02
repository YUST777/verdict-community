import type { MediaParserController } from '../controller/media-parser-controller';
import type { SeekSignal } from '../controller/seek-signal';
import type { AllOptions, Options, ParseMediaFields } from '../fields';
import type { MediaParserLogLevel } from '../log';
import type { ParseMediaSrc } from '../options';
import type { MediaParserAudioSample, MediaParserOnAudioSample, MediaParserOnVideoSample, MediaParserVideoSample } from '../webcodec-sample-types';
import { type KeyframesState } from './keyframes';
import type { SamplesObservedState } from './samples-observed/slow-duration-fps';
import type { StructureState } from './structure';
export declare const callbacksState: ({ controller, hasAudioTrackHandlers, hasVideoTrackHandlers, fields, keyframes, emittedFields, samplesObserved, structure, src, seekSignal, logLevel, }: {
    controller: MediaParserController;
    hasAudioTrackHandlers: boolean;
    hasVideoTrackHandlers: boolean;
    fields: Options<ParseMediaFields>;
    keyframes: KeyframesState;
    emittedFields: AllOptions<ParseMediaFields>;
    samplesObserved: SamplesObservedState;
    structure: StructureState;
    src: ParseMediaSrc;
    seekSignal: SeekSignal;
    logLevel: MediaParserLogLevel;
}) => {
    registerVideoSampleCallback: (id: number, callback: MediaParserOnVideoSample | null) => Promise<void>;
    onAudioSample: ({ audioSample, trackId, }: {
        trackId: number;
        audioSample: MediaParserAudioSample;
    }) => Promise<void>;
    onVideoSample: ({ trackId, videoSample, }: {
        trackId: number;
        videoSample: MediaParserVideoSample;
    }) => Promise<void>;
    canSkipTracksState: {
        doFieldsNeedTracks: () => boolean;
        canSkipTracks: () => boolean;
    };
    registerAudioSampleCallback: (id: number, callback: MediaParserOnAudioSample | null) => Promise<void>;
    tracks: {
        hasAllTracks: () => boolean;
        getIsDone: () => boolean;
        setIsDone: (logLevel: MediaParserLogLevel) => void;
        addTrack: (track: import("..").MediaParserTrack) => void;
        getTracks: () => import("..").MediaParserTrack[];
        ensureHasTracksAtEnd: (fields: Options<ParseMediaFields>) => void;
    };
    audioSampleCallbacks: Record<number, MediaParserOnAudioSample>;
    videoSampleCallbacks: Record<number, MediaParserOnVideoSample>;
    hasAudioTrackHandlers: boolean;
    hasVideoTrackHandlers: boolean;
    callTracksDoneCallback: () => Promise<void>;
};
export type CallbacksState = ReturnType<typeof callbacksState>;
