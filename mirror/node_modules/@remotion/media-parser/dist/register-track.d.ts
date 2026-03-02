import type { MediaParserAudioTrack, MediaParserTrack, MediaParserVideoTrack } from './get-tracks';
import type { MediaParserLogLevel } from './log';
import type { MediaParserContainer } from './options';
import type { TracksState } from './state/has-tracks-section';
import type { ParserState } from './state/parser-state';
import type { CallbacksState } from './state/sample-callbacks';
import type { MediaParserOnAudioTrack, MediaParserOnVideoTrack } from './webcodec-sample-types';
export declare const registerVideoTrack: ({ track, container, logLevel, onVideoTrack, registerVideoSampleCallback, tracks, }: {
    track: MediaParserTrack;
    container: MediaParserContainer;
    logLevel: MediaParserLogLevel;
    onVideoTrack: MediaParserOnVideoTrack | null;
    registerVideoSampleCallback: CallbacksState["registerVideoSampleCallback"];
    tracks: TracksState;
}) => Promise<import("./webcodec-sample-types").MediaParserOnVideoSample | null>;
export declare const registerAudioTrack: ({ track, container, tracks, logLevel, onAudioTrack, registerAudioSampleCallback, }: {
    track: MediaParserAudioTrack;
    container: MediaParserContainer;
    tracks: TracksState;
    logLevel: MediaParserLogLevel;
    onAudioTrack: MediaParserOnAudioTrack | null;
    registerAudioSampleCallback: CallbacksState["registerAudioSampleCallback"];
}) => Promise<import("./webcodec-sample-types").MediaParserOnAudioSample | null>;
export declare const registerVideoTrackWhenProfileIsAvailable: ({ state, track, container, }: {
    state: ParserState;
    track: MediaParserVideoTrack;
    container: MediaParserContainer;
}) => void;
