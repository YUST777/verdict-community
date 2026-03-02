import type { SamplePosition } from '../../get-sample-positions';
import type { ParserState } from '../parser-state';
type TrackIdAndSamplePositions = {
    trackId: number;
    samplePositions: SamplePosition[];
};
export declare const calculateSamplePositions: ({ state, mediaSectionStart, trackIds, }: {
    state: ParserState;
    mediaSectionStart: number;
    trackIds: number[];
}) => TrackIdAndSamplePositions[];
export declare const cachedSamplePositionsState: () => {
    getSamples: (mdatStart: number) => TrackIdAndSamplePositions[] | null;
    setSamples: (mdatStart: number, samples: TrackIdAndSamplePositions[]) => void;
    setCurrentSampleIndex: (mdatStart: number, trackId: number, index: number) => void;
    getCurrentSampleIndices: (mdatStart: number) => Record<number, number>;
    updateAfterSeek: (seekedByte: number) => void;
};
type Lowest = {
    samplePosition: SamplePosition;
    trackId: number;
    index: number;
};
export declare const getSampleWithLowestDts: (samplePositions: TrackIdAndSamplePositions[], currentSampleIndexMap: Record<number, number>) => Lowest[];
export {};
