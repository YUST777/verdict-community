import type { MediaParserAudioTrack, MediaParserTrack, MediaParserVideoTrack } from '../../get-tracks';
import type { ParserState } from '../../state/parser-state';
import type { RiffStructure, StrfBoxAudio, StrfBoxVideo, StrhBox } from './riff-box';
export declare const TO_BE_OVERRIDDEN_LATER = "to-be-overriden-later";
export declare const getNumberOfTracks: (structure: RiffStructure) => number;
export declare const makeAviAudioTrack: ({ strf, index, }: {
    strf: StrfBoxAudio;
    index: number;
}) => MediaParserAudioTrack;
export declare const makeAviVideoTrack: ({ strh, strf, index, }: {
    strh: StrhBox;
    strf: StrfBoxVideo;
    index: number;
}) => MediaParserVideoTrack;
export declare const getTracksFromAvi: (structure: RiffStructure, state: ParserState) => MediaParserTrack[];
export declare const hasAllTracksFromAvi: (state: ParserState) => boolean;
