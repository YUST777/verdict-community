import type { WebmSeekingHints } from '../../../seeking-hints';
import type { TracksState } from '../../../state/has-tracks-section';
import type { KeyframesState } from '../../../state/keyframes';
import type { WebmState } from '../../../state/matroska/webm';
import type { ParserState } from '../../../state/parser-state';
export declare const getSeekingHintsFromMatroska: (tracksState: TracksState, keyframesState: KeyframesState, webmState: WebmState) => WebmSeekingHints;
export declare const setSeekingHintsForWebm: ({ hints, state, }: {
    hints: WebmSeekingHints;
    state: ParserState;
}) => void;
