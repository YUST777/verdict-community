import type { WavSeekingHints } from '../../seeking-hints';
import type { ParserState } from '../../state/parser-state';
import type { MediaSectionState } from '../../state/video-section';
import type { WavStructure } from './types';
export declare const getSeekingHintsFromWav: ({ structure, mediaSectionState, }: {
    structure: WavStructure;
    mediaSectionState: MediaSectionState;
}) => WavSeekingHints | null;
export declare const setSeekingHintsForWav: ({ hints, state, }: {
    hints: WavSeekingHints;
    state: ParserState;
}) => void;
