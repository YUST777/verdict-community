import type { TransportStreamSeekingHints } from '../../seeking-hints';
import type { TracksState } from '../../state/has-tracks-section';
import type { ParserState } from '../../state/parser-state';
import type { TransportStreamState } from '../../state/transport-stream/transport-stream';
export declare const getSeekingHintsFromTransportStream: (transportStream: TransportStreamState, tracksState: TracksState) => TransportStreamSeekingHints | null;
export declare const setSeekingHintsForTransportStream: ({ hints, state, }: {
    hints: TransportStreamSeekingHints;
    state: ParserState;
}) => void;
