import type { SamplePosition } from '../../get-sample-positions';
import type { MediaParserAudioTrack, MediaParserOtherTrack, MediaParserVideoTrack } from '../../get-tracks';
import type { IsoBaseMediaStructure } from '../../parse-result';
import type { StructureState } from '../../state/structure';
export declare const findAnyTrackWithSamplePositions: (allTracks: (MediaParserVideoTrack | MediaParserAudioTrack | MediaParserOtherTrack)[], struc: IsoBaseMediaStructure) => {
    track: MediaParserVideoTrack | MediaParserAudioTrack;
    samplePositions: SamplePosition[];
} | null;
type TrackWithSamplePositions = {
    track: MediaParserVideoTrack | MediaParserAudioTrack;
    samplePositions: SamplePosition[];
};
export declare const findTrackToSeek: (allTracks: (MediaParserVideoTrack | MediaParserAudioTrack | MediaParserOtherTrack)[], structure: StructureState) => TrackWithSamplePositions | null;
export {};
