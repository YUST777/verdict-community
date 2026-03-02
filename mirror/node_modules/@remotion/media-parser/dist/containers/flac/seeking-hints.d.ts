import type { AudioSampleOffset } from '../../state/audio-sample-map';
import type { FlacState } from '../../state/flac-state';
import type { ParserState } from '../../state/parser-state';
import type { SamplesObservedState } from '../../state/samples-observed/slow-duration-fps';
export type FlacSeekingHints = {
    type: 'flac-seeking-hints';
    audioSampleMap: AudioSampleOffset[];
    blockingBitStrategy: number | null;
    lastSampleObserved: boolean;
};
export declare const getSeekingHintsForFlac: ({ flacState, samplesObserved, }: {
    flacState: FlacState;
    samplesObserved: SamplesObservedState;
}) => FlacSeekingHints;
export declare const setSeekingHintsForFlac: ({ hints, state, }: {
    hints: FlacSeekingHints;
    state: ParserState;
}) => void;
