import type { AacState } from '../../state/aac-state';
import type { AudioSampleOffset } from '../../state/audio-sample-map';
import type { SamplesObservedState } from '../../state/samples-observed/slow-duration-fps';
export type AacSeekingHints = {
    type: 'aac-seeking-hints';
    audioSampleMap: AudioSampleOffset[];
    lastSampleObserved: boolean;
};
export declare const getSeekingHintsForAac: ({ aacState, samplesObserved, }: {
    aacState: AacState;
    samplesObserved: SamplesObservedState;
}) => AacSeekingHints;
export declare const setSeekingHintsForAac: () => void;
