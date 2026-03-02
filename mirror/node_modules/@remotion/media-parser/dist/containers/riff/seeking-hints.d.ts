import type { ParserState } from '../../state/parser-state';
import type { RiffState } from '../../state/riff';
import type { RiffKeyframe } from '../../state/riff/riff-keyframes';
import type { StructureState } from '../../state/structure';
import type { MediaSectionState } from '../../state/video-section';
import type { FetchIdx1Result } from './seek/fetch-idx1';
export type RiffSeekingHints = {
    type: 'riff-seeking-hints';
    hasIndex: boolean;
    idx1Entries: FetchIdx1Result | null;
    samplesPerSecond: number | null;
    moviOffset: number | null;
    observedKeyframes: RiffKeyframe[];
};
export declare const getSeekingHintsForRiff: ({ structureState, riffState, mediaSectionState, }: {
    structureState: StructureState;
    riffState: RiffState;
    mediaSectionState: MediaSectionState;
}) => RiffSeekingHints;
export declare const setSeekingHintsForRiff: ({ hints, state, }: {
    hints: RiffSeekingHints;
    state: ParserState;
}) => void;
