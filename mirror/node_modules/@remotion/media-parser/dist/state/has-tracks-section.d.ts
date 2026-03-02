import type { Options, ParseMediaFields } from '../fields';
import type { MediaParserTrack } from '../get-tracks';
import type { MediaParserLogLevel } from '../log';
import type { ParseMediaSrc } from '../options';
import type { CanSkipTracksState } from './can-skip-tracks';
export declare const makeTracksSectionState: (canSkipTracksState: CanSkipTracksState, src: ParseMediaSrc) => {
    hasAllTracks: () => boolean;
    getIsDone: () => boolean;
    setIsDone: (logLevel: MediaParserLogLevel) => void;
    addTrack: (track: MediaParserTrack) => void;
    getTracks: () => MediaParserTrack[];
    ensureHasTracksAtEnd: (fields: Options<ParseMediaFields>) => void;
};
export type TracksState = ReturnType<typeof makeTracksSectionState>;
